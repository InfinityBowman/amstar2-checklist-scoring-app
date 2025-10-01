// Helper: Save blob to IndexedDB (for Firefox/Safari)
function saveBlobToIndexedDB(file) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fileStorageDB', 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files', { keyPath: 'name' });
      }
    };
    request.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      store.put({ name: file.name, blob: file });
      tx.oncomplete = () => resolve(file.name);
      tx.onerror = reject;
    };
    request.onerror = reject;
  });
}

// Helper: Get blob from IndexedDB
function getBlobFromIndexedDB(fileName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fileStorageDB', 1);
    request.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction('files', 'readonly');
      const store = tx.objectStore('files');
      const getReq = store.get(fileName);
      getReq.onsuccess = () => resolve(getReq.result?.blob || null);
      getReq.onerror = reject;
    };
    request.onerror = reject;
  });
}

// Prompt user to select a file and save it to OPFS or IndexedDB
export async function uploadAndStoreFile() {
  let file;
  // Use File System Access API picker if available
  if (window.showOpenFilePicker) {
    const [fileHandle] = await window.showOpenFilePicker();
    file = await fileHandle.getFile();
  } else {
    console.warn('showOpenFilePicker not supported, falling back to manual file selection.');
    // Fallback: use <input type="file">
    file = await new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.onchange = () => resolve(input.files[0]);
      input.click();
    });
  }

  // Store file in OPFS if supported
  if (navigator.storage?.getDirectory) {
    const root = await navigator.storage.getDirectory();
    const newFileHandle = await root.getFileHandle(file.name, { create: true });
    const writable = await newFileHandle.createWritable();
    await writable.write(await file.arrayBuffer());
    await writable.close();
    return file.name;
  } else {
    console.warn('File System Access API getDirectory not supported, falling back to IndexedDB.');
    // Fallback: IndexedDB
    await saveBlobToIndexedDB(file);
    return file.name;
  }
}

export async function getStoredFile(fileName) {
  if (navigator.storage?.getDirectory) {
    const root = await navigator.storage.getDirectory();
    const fileHandle = await root.getFileHandle(fileName);
    return await fileHandle.getFile();
  } else {
    console.warn('File System Access API getDirectory not supported, falling back to IndexedDB.');
    return await getBlobFromIndexedDB(fileName);
  }
}
