import { ObjectId } from 'mongodb';
import redisClient from '../redisClient';
import DBCrud from '../DBCrud';
import { saveFileLocally, pathToBeReturned } from '../saveFileLocally';
import dbClient from '../dbClient';

class FilesController {
  static async postUpload(req, res) {
    try {
      // Authentication check
      const token = req.header('x-token');
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const key = `auth_${token}`;
      const userId = await redisClient.get(key);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await DBCrud.findUser({ _id: new ObjectId(userId) });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // File/folder creation validation
      const { name, type, parentId = '0', isPublic = false, data } = req.body;

      // Check if the name is provided
      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }

      // Accepted file types
      const acceptedTypes = ['folder', 'file', 'image'];

      // Check if the type is valid
      if (!type || !acceptedTypes.includes(type)) {
        return res.status(400).json({ error: 'Missing type' });
      }

      // Check if data is provided for non-folder types
      if (!data && type !== 'folder') {
        return res.status(400).json({ error: 'Missing data' });
      }

      // Check if data is present for folders
      if (data && type === 'folder') {
        return res.status(400).json({ error: 'Cannot upload file as folder' });
      }

      // Validate parent folder
      if (parentId !== '0') {
        const parentFolder = await DBCrud.findFile({ _id: new ObjectId(parentId) });

        if (!parentFolder) {
          return res.status(400).json({ error: 'Parent not found' });
        }

        if (parentFolder.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      // Prepare the new file/folder document
      const newFileOrFolder = {
        userId: new ObjectId(user._id),
        name,
        type,
        isPublic,
        parentId,
      };

      // Handle file or folder creation
      if (type === 'folder') {
        // Create folder document in the database
        const dbResult = await DBCrud.addNewFile(newFileOrFolder);
        newFileOrFolder.id = dbResult.insertedId;
        return res.status(201).json(newFileOrFolder);
      }

      // Handle file creation
      const localPath = await saveFileLocally(data);
      if (!localPath) {
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      // Update the newFileOrFolder document with localPath
      newFileOrFolder.localPath = pathToBeReturned;

      // Create file document in the database
      const dbResult = await DBCrud.addNewFile(newFileOrFolder);
      newFileOrFolder.id = dbResult.insertedId;

      // Remove unnecessary details before returning to the user
      if (newFileOrFolder._id) delete newFileOrFolder._id;
      if (newFileOrFolder.localPath) delete newFileOrFolder.localPath;

      return res.status(201).json(newFileOrFolder);
    } catch (error) {
      console.error('Error in postUpload request: ', error.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getShow(req, res) {
    const token = req.headers['x-token'];
    const redisKey = `auth_${token}`;
    const userId = await redisClient.get(redisKey);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fileId = req.params.id;
    const file = await dbClient.db.collection('files').findOne({
      _id: new ObjectId(fileId),
      userId: new ObjectId(userId),
    });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.json({
      id: file._id.toString(),
      userId: file.userId.toString(),
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
  }

  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    const redisKey = `auth_${token}`;
    const userId = await redisClient.get(redisKey);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const parentId = req.query.parentId || '0';
    const page = parseInt(req.query.page, 10) || 0;
    const pageSize = 20;

    const files = await dbClient.db.collection('files')
      .aggregate([
        {
          $match: {
            userId: new ObjectId(userId),
            parentId: parentId === '0' ? 0 : new ObjectId(parentId),
          },
        },
        {
          $skip: page * pageSize,
        },
        {
          $limit: pageSize,
        },
      ])
      .toArray();

    const formattedFiles = files.map((file) => ({
      id: file._id.toString(),
      userId: file.userId.toString(),
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    }));

    return res.json(formattedFiles);
  }
	
static async putPublish(req, res) {
  try {
    const token = req.header('x-token');
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fileId = req.params.id;
    const file = await DBCrud.findFile({
      _id: new ObjectId(fileId),
      userId: new ObjectId(userId),
    });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    await DBCrud.updateFile(file._id, { isPublic: true });

    return res.status(200).json({
      id: file._id.toString(),
      userId: file.userId.toString(),
      name: file.name,
      type: file.type,
      isPublic: true,
      parentId: file.parentId,
    });
  } catch (error) {
    console.error('Error in putPublish request:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Task 7: Unpublish a file
static async putUnpublish(req, res) {
  try {
    const token = req.header('x-token');
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fileId = req.params.id;
    const file = await DBCrud.findFile({
      _id: new ObjectId(fileId),
      userId: new ObjectId(userId),
    });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    await DBCrud.updateFile(file._id, { isPublic: false });

    return res.status(200).json({
      id: file._id.toString(),
      userId: file.userId.toString(),
      name: file.name,
      type: file.type,
      isPublic: false,
      parentId: file.parentId,
    });
  } catch (error) {
    console.error('Error in putUnpublish request:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Task 8: Fetch file data
static async getFile(req, res) {
  try {
    const token = req.header('x-token');
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fileId = req.params.id;
    const file = await DBCrud.findFile({
      _id: new ObjectId(fileId),
      userId: new ObjectId(userId),
    });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (!file.isPublic && file.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return res.status(200).json({
      id: file._id.toString(),
      userId: file.userId.toString(),
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
  } catch (error) {
    console.error('Error in getFile request:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default FilesController;
