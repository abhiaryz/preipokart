export type ResumeMeta = {
  name: string;
  size: number;
  type: string;
};

export type JobApplication = {
  id: string;
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  linkedin: string;
  note: string;
  resume: ResumeMeta;
  submittedAt: string;
};

const STORAGE_KEY = 'preipokart-applications';
const DB_NAME = 'preipokart';
const DB_VERSION = 1;
const RESUME_STORE = 'resumes';

export function readApplications(): JobApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as JobApplication[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function hasApplied(jobId: string) {
  return readApplications().some((row) => row.jobId === jobId);
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(RESUME_STORE)) {
        req.result.createObjectStore(RESUME_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function putResume(id: string, file: File) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(RESUME_STORE, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(RESUME_STORE).put(file, id);
  });
  db.close();
}

export async function pushApplication(input: {
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  linkedin: string;
  note: string;
  file: File;
}): Promise<JobApplication> {
  const id = `app-${crypto.randomUUID()}`;
  const record: JobApplication = {
    id,
    jobId: input.jobId,
    jobTitle: input.jobTitle,
    name: input.name,
    email: input.email,
    phone: input.phone,
    city: input.city,
    linkedin: input.linkedin,
    note: input.note,
    resume: {
      name: input.file.name,
      size: input.file.size,
      type: input.file.type || 'application/octet-stream',
    },
    submittedAt: new Date().toISOString(),
  };

  await putResume(id, input.file);

  const next = [record, ...readApplications()];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return record;
}
