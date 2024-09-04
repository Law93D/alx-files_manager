const fileQueue = require('./utils/fileQueue');
const DBCrud = require('./utils/DBCrud');
const { generateThumbnails } = require('./utils/image-thumbnail');

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId) throw new Error('Missing fileId');
  if (!userId) throw new Error('Missing userId');

  const file = await DBCrud.findFile({ _id: fileId, userId });

  if (!file) throw new Error('File not found');

  try {
    await generateThumbnails(file.path);
  } catch (error) {
    throw new Error('Thumbnail generation failed');
  }
});

fileQueue.on('completed', (job) => {
  console.log(`Job completed with id ${job.id}`);
});

fileQueue.on('failed', (job, err) => {
  console.error(`Job failed with id ${job.id}. Error: ${err.message}`);
});

console.log('Worker started');
