const createChunksWorker = () => {
  const workerCode = `
      self.onmessage = function(event) {
        const { file } = event.data;

        const calculateChunkSize = (fileSize) => {
          if (fileSize < 10 * 1024 * 1024) {
            return fileSize;
          } else if (fileSize < 100 * 1024 * 1024) {
            return 5 * 1024 * 1024; // 5MB
          } else if (fileSize < 1024 * 1024 * 1024) {
            return 20 * 1024 * 1024; // 20MB
          } else {
            return 40 * 1024 * 1024; // 40MB
          }
        };

        const chunkSize = calculateChunkSize(file.size);
        const chunks = [];
        
        if(file.size === 0) {
          chunks.push({
            file: file,
            filename: file.name
          });
        } else {
          let start = 0;
          while (start < file.size) {
          const end = Math.min(start + chunkSize, file.size);
          chunks.push({
            file: file.slice(start, end),
            filename: file.name
          });
          start = end;
        }}

        self.postMessage({type: 'chunks', chunks });
        self.close();
      };
    `;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(blob);
  return {
    worker: new Worker(workerUrl),
    cleanup: () => URL.revokeObjectURL(workerUrl)
  };
};

export default createChunksWorker;
