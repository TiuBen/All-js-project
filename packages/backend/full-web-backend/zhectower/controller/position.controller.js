const {PositionService} = require('../service/index.js'); // 假设有一个 PositionService 处理业务逻辑




const PositionController = {
    // 获取所有职位
    GetPositions: async function (req, res) {
      console.log("获取所有职位");
      // console.log(PositionService);
      
      
      try {
        const positions = await PositionService.findAll();
        res.status(200).json(positions);
      } catch (error) {
        res.status(500).json({ message: 'Failed to fetch positions', error: error.message });
      }
    },
  
    // 获取单个职位
    GetPosition: function (req, res) {
      try {
        const positionId = req.params.id;
        const position = PositionService.findById(positionId);
        if (position) {
          res.status(200).json(position);
        } else {
          res.status(404).json({ message: 'Position not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Failed to fetch position', error: error.message });
      }
    },
  
    // 创建新职位
    PostNewPosition: function (req, res) {
      try {
        const newPosition = req.body;
        const createdPosition = PositionService.create(newPosition);
        res.status(201).json(createdPosition);
      } catch (error) {
        res.status(500).json({ message: 'Failed to create position', error: error.message });
      }
    },
  
    // 更新职位（替换整个资源）
    PutPosition: function (req, res) {
      console.log("更新职位（替换整个资源）");

      try {
        const positionId = req.params.id;
        const updatedPosition = req.body;
        const result = PositionService.update(positionId, updatedPosition);
        if (result) {
          res.status(200).json(result);
        } else {
          res.status(404).json({ message: 'Position not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Failed to update position', error: error.message });
      }
    },
  
   
  
    // 删除职位
    DeletePosition: function (req, res) {
      try {
        const positionId = req.params.id;
        const result = PositionService.delete(positionId);
        if (result) {
          res.status(204).send(); // 204 No Content
        } else {
          res.status(404).json({ message: 'Position not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Failed to delete position', error: error.message });
      }
    },
  };
  
  module.exports = PositionController;