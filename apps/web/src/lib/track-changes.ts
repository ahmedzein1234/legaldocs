/**
 * Track Changes System for Legal Documents
 * Tracks insertions, deletions, and modifications with user attribution
 */

export interface Change {
  id: string;
  type: 'insertion' | 'deletion' | 'modification';
  timestamp: Date;
  userId: string;
  userName: string;
  originalContent?: string;
  newContent?: string;
  position: {
    from: number;
    to: number;
  };
  status: 'pending' | 'accepted' | 'rejected';
  comment?: string;
}

export interface DocumentVersion {
  id: string;
  version: number;
  content: string;
  htmlContent?: string;
  timestamp: Date;
  userId: string;
  userName: string;
  changes: Change[];
  comment?: string;
  isAutoSave?: boolean;
}

export interface TrackChangesState {
  isEnabled: boolean;
  currentUserId: string;
  currentUserName: string;
  changes: Change[];
  versions: DocumentVersion[];
  currentVersion: number;
}

/**
 * Generate unique ID for changes
 */
export function generateChangeId(): string {
  return `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate unique ID for versions
 */
export function generateVersionId(): string {
  return `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create initial track changes state
 */
export function createTrackChangesState(
  userId: string = 'user',
  userName: string = 'User'
): TrackChangesState {
  return {
    isEnabled: false,
    currentUserId: userId,
    currentUserName: userName,
    changes: [],
    versions: [],
    currentVersion: 0,
  };
}

/**
 * Create a new change record
 */
export function createChange(
  type: Change['type'],
  userId: string,
  userName: string,
  position: Change['position'],
  originalContent?: string,
  newContent?: string,
  comment?: string
): Change {
  return {
    id: generateChangeId(),
    type,
    timestamp: new Date(),
    userId,
    userName,
    originalContent,
    newContent,
    position,
    status: 'pending',
    comment,
  };
}

/**
 * Create a new version snapshot
 */
export function createVersion(
  versionNumber: number,
  content: string,
  userId: string,
  userName: string,
  changes: Change[],
  htmlContent?: string,
  comment?: string,
  isAutoSave: boolean = false
): DocumentVersion {
  return {
    id: generateVersionId(),
    version: versionNumber,
    content,
    htmlContent,
    timestamp: new Date(),
    userId,
    userName,
    changes: [...changes],
    comment,
    isAutoSave,
  };
}

/**
 * Accept a change
 */
export function acceptChange(state: TrackChangesState, changeId: string): TrackChangesState {
  return {
    ...state,
    changes: state.changes.map(change =>
      change.id === changeId ? { ...change, status: 'accepted' as const } : change
    ),
  };
}

/**
 * Reject a change
 */
export function rejectChange(state: TrackChangesState, changeId: string): TrackChangesState {
  return {
    ...state,
    changes: state.changes.map(change =>
      change.id === changeId ? { ...change, status: 'rejected' as const } : change
    ),
  };
}

/**
 * Accept all changes
 */
export function acceptAllChanges(state: TrackChangesState): TrackChangesState {
  return {
    ...state,
    changes: state.changes.map(change => ({
      ...change,
      status: 'accepted' as const,
    })),
  };
}

/**
 * Reject all changes
 */
export function rejectAllChanges(state: TrackChangesState): TrackChangesState {
  return {
    ...state,
    changes: state.changes.map(change => ({
      ...change,
      status: 'rejected' as const,
    })),
  };
}

/**
 * Get pending changes
 */
export function getPendingChanges(state: TrackChangesState): Change[] {
  return state.changes.filter(change => change.status === 'pending');
}

/**
 * Get changes by user
 */
export function getChangesByUser(state: TrackChangesState, userId: string): Change[] {
  return state.changes.filter(change => change.userId === userId);
}

/**
 * Add a new version
 */
export function addVersion(
  state: TrackChangesState,
  content: string,
  htmlContent?: string,
  comment?: string,
  isAutoSave: boolean = false
): TrackChangesState {
  const newVersion = createVersion(
    state.versions.length + 1,
    content,
    state.currentUserId,
    state.currentUserName,
    state.changes,
    htmlContent,
    comment,
    isAutoSave
  );

  return {
    ...state,
    versions: [...state.versions, newVersion],
    currentVersion: state.versions.length + 1,
  };
}

/**
 * Get version history (non-autosave versions)
 */
export function getVersionHistory(state: TrackChangesState): DocumentVersion[] {
  return state.versions.filter(v => !v.isAutoSave);
}

/**
 * Restore to a specific version
 */
export function restoreToVersion(
  state: TrackChangesState,
  versionId: string
): { state: TrackChangesState; content: string; htmlContent?: string } | null {
  const version = state.versions.find(v => v.id === versionId);
  if (!version) return null;

  return {
    state: {
      ...state,
      currentVersion: version.version,
      changes: version.changes,
    },
    content: version.content,
    htmlContent: version.htmlContent,
  };
}

/**
 * Compare two versions and get diff
 */
export function compareVersions(
  state: TrackChangesState,
  versionId1: string,
  versionId2: string
): { additions: string[]; deletions: string[] } | null {
  const v1 = state.versions.find(v => v.id === versionId1);
  const v2 = state.versions.find(v => v.id === versionId2);

  if (!v1 || !v2) return null;

  const lines1 = v1.content.split('\n');
  const lines2 = v2.content.split('\n');

  const additions = lines2.filter(line => !lines1.includes(line));
  const deletions = lines1.filter(line => !lines2.includes(line));

  return { additions, deletions };
}

/**
 * Format change for display
 */
export function formatChange(change: Change, language: 'en' | 'ar' = 'en'): string {
  const typeLabels = {
    insertion: language === 'ar' ? 'إضافة' : 'Insertion',
    deletion: language === 'ar' ? 'حذف' : 'Deletion',
    modification: language === 'ar' ? 'تعديل' : 'Modification',
  };

  const statusLabels = {
    pending: language === 'ar' ? 'قيد الانتظار' : 'Pending',
    accepted: language === 'ar' ? 'مقبول' : 'Accepted',
    rejected: language === 'ar' ? 'مرفوض' : 'Rejected',
  };

  const date = change.timestamp.toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-AE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${typeLabels[change.type]} by ${change.userName} on ${date} - ${statusLabels[change.status]}`;
}

/**
 * Format version for display
 */
export function formatVersion(version: DocumentVersion, language: 'en' | 'ar' = 'en'): string {
  const date = version.timestamp.toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-AE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const label = language === 'ar' ? 'الإصدار' : 'Version';
  const byLabel = language === 'ar' ? 'بواسطة' : 'by';

  return `${label} ${version.version} - ${date} ${byLabel} ${version.userName}`;
}

/**
 * Calculate change statistics
 */
export function getChangeStats(state: TrackChangesState): {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  insertions: number;
  deletions: number;
  modifications: number;
} {
  const changes = state.changes;
  return {
    total: changes.length,
    pending: changes.filter(c => c.status === 'pending').length,
    accepted: changes.filter(c => c.status === 'accepted').length,
    rejected: changes.filter(c => c.status === 'rejected').length,
    insertions: changes.filter(c => c.type === 'insertion').length,
    deletions: changes.filter(c => c.type === 'deletion').length,
    modifications: changes.filter(c => c.type === 'modification').length,
  };
}

/**
 * Serialize track changes state for storage
 */
export function serializeState(state: TrackChangesState): string {
  return JSON.stringify({
    ...state,
    changes: state.changes.map(c => ({
      ...c,
      timestamp: c.timestamp.toISOString(),
    })),
    versions: state.versions.map(v => ({
      ...v,
      timestamp: v.timestamp.toISOString(),
      changes: v.changes.map(c => ({
        ...c,
        timestamp: c.timestamp.toISOString(),
      })),
    })),
  });
}

/**
 * Deserialize track changes state from storage
 */
export function deserializeState(json: string): TrackChangesState {
  const data = JSON.parse(json);
  return {
    ...data,
    changes: data.changes.map((c: any) => ({
      ...c,
      timestamp: new Date(c.timestamp),
    })),
    versions: data.versions.map((v: any) => ({
      ...v,
      timestamp: new Date(v.timestamp),
      changes: v.changes.map((c: any) => ({
        ...c,
        timestamp: new Date(c.timestamp),
      })),
    })),
  };
}

export default {
  createTrackChangesState,
  createChange,
  createVersion,
  acceptChange,
  rejectChange,
  acceptAllChanges,
  rejectAllChanges,
  getPendingChanges,
  getChangesByUser,
  addVersion,
  getVersionHistory,
  restoreToVersion,
  compareVersions,
  formatChange,
  formatVersion,
  getChangeStats,
  serializeState,
  deserializeState,
};
