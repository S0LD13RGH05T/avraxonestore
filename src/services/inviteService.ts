import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  arrayUnion,
  orderBy
} from 'firebase/firestore';

export interface WorkspaceInvite {
  id: string;
  coupleId: string;
  coupleName: string;
  ownerUid: string;
  ownerName: string;
  token: string;
  code: string; // 4-digit code e.g. "4729"
  status: 'PENDENTE' | 'ACEITO' | 'EXPIRADO' | 'CANCELADO';
  createdAt: string;
  expiresAt: string; // ISO string 24h later
  acceptedByUid?: string;
  acceptedByName?: string;
  acceptedAt?: string;
}

// Generate secure 4-digit code
function generate4DigitCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Generate random secure token
function generateSecureToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = 'inv_';
  for (let i = 0; i < 24; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Creates a new secure invitation for a workspace
 */
export async function createWorkspaceInvite(
  coupleId: string, 
  coupleName: string, 
  ownerUid: string, 
  ownerName: string
): Promise<WorkspaceInvite> {
  const token = generateSecureToken();
  const code = generate4DigitCode();
  const inviteId = doc(collection(db, 'invites')).id;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // 24h validity

  const inviteData: WorkspaceInvite = {
    id: inviteId,
    coupleId,
    coupleName: coupleName || 'Finanças Compartilhadas',
    ownerUid,
    ownerName: ownerName || 'Proprietário',
    token,
    code,
    status: 'PENDENTE',
    createdAt: now.toISOString(),
    expiresAt
  };

  // Save to top-level invites collection
  await setDoc(doc(db, 'invites', inviteId), inviteData);

  return inviteData;
}

/**
 * Get active or existing invite by token
 */
export async function getInviteByToken(token: string): Promise<WorkspaceInvite | null> {
  if (!token) return null;
  try {
    const q = query(collection(db, 'invites'), where('token', '==', token));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    
    const invite = { id: snap.docs[0].id, ...snap.docs[0].data() } as WorkspaceInvite;
    
    // Check if expired
    if (invite.status === 'PENDENTE' && new Date(invite.expiresAt).getTime() < Date.now()) {
      await updateDoc(doc(db, 'invites', invite.id), { status: 'EXPIRADO' });
      invite.status = 'EXPIRADO';
    }

    return invite;
  } catch (error) {
    console.error('Error getting invite by token:', error);
    return null;
  }
}

/**
 * Get active invite by 4-digit code
 */
export async function getInviteByCode(code: string): Promise<WorkspaceInvite | null> {
  if (!code || code.length !== 4) return null;
  try {
    const q = query(
      collection(db, 'invites'), 
      where('code', '==', code.trim()),
      where('status', '==', 'PENDENTE')
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    
    const invite = { id: snap.docs[0].id, ...snap.docs[0].data() } as WorkspaceInvite;

    // Check if expired
    if (new Date(invite.expiresAt).getTime() < Date.now()) {
      await updateDoc(doc(db, 'invites', invite.id), { status: 'EXPIRADO' });
      return null;
    }

    return invite;
  } catch (error) {
    console.error('Error getting invite by code:', error);
    return null;
  }
}

/**
 * Accept invite and associate joining user to the workspace
 */
export async function acceptWorkspaceInvite(
  invite: WorkspaceInvite, 
  userUid: string, 
  userName: string,
  updateProfileFn: (data: any) => Promise<void>
): Promise<boolean> {
  try {
    // 1. Verify invite status
    const inviteRef = doc(db, 'invites', invite.id);
    const inviteSnap = await getDoc(inviteRef);
    if (!inviteSnap.exists()) throw new Error('Convite não encontrado.');

    const currentData = inviteSnap.data() as WorkspaceInvite;
    if (currentData.status !== 'PENDENTE') {
      throw new Error(`Este convite está com status ${currentData.status}.`);
    }

    if (new Date(currentData.expiresAt).getTime() < Date.now()) {
      await updateDoc(inviteRef, { status: 'EXPIRADO' });
      throw new Error('Este convite expirou.');
    }

    // 2. Mark invite as ACEITO
    const acceptedAt = new Date().toISOString();
    await updateDoc(inviteRef, {
      status: 'ACEITO',
      acceptedByUid: userUid,
      acceptedByName: userName,
      acceptedAt
    });

    // 3. Update couple/workspace doc
    const coupleRef = doc(db, 'couples', invite.coupleId);
    const coupleSnap = await getDoc(coupleRef);
    if (coupleSnap.exists()) {
      await updateDoc(coupleRef, {
        partner2: userUid,
        partner2Name: userName
      });
    }

    // 4. Update user profile to set currentCoupleId and add to workspaceIds
    await updateProfileFn({
      currentCoupleId: invite.coupleId,
      role: 'partner2'
    });

    return true;
  } catch (error) {
    console.error('Error accepting invite:', error);
    throw error;
  }
}

/**
 * Cancel an active invite
 */
export async function cancelWorkspaceInvite(inviteId: string): Promise<void> {
  const inviteRef = doc(db, 'invites', inviteId);
  await updateDoc(inviteRef, { status: 'CANCELADO' });
}

/**
 * Get all invites for a specific workspace
 */
export async function getWorkspaceInvites(coupleId: string): Promise<WorkspaceInvite[]> {
  try {
    const q = query(
      collection(db, 'invites'),
      where('coupleId', '==', coupleId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as WorkspaceInvite));
  } catch (error) {
    console.error('Error fetching workspace invites:', error);
    return [];
  }
}

/**
 * Remove a partner/member from workspace
 */
export async function removeWorkspacePartner(coupleId: string): Promise<void> {
  const coupleRef = doc(db, 'couples', coupleId);
  await updateDoc(coupleRef, {
    partner2: null,
    partner2Name: null
  });
}
