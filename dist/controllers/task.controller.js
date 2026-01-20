"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const task_service_1 = require("../services/task.service");
class TaskController {
    constructor() {
        this.getTasks = async (req, res) => {
            try {
                const userId = req.user?.userId;
                if (!userId)
                    return res.status(401).json({ error: 'Unauthorized' });
                const tasks = await this.taskService.getTasks(userId);
                return res.json({ tasks });
            }
            catch (error) {
                return res.status(500).json({ error: error.message });
            }
        };
        this.completeTask = async (req, res) => {
            try {
                const userId = req.user?.userId;
                const { taskId, proof } = req.body;
                if (!userId)
                    return res.status(401).json({ error: 'Unauthorized' });
                const result = await this.taskService.verifyAndCompleteTask(userId, taskId, proof);
                return res.json(result);
            }
            catch (error) {
                return res.status(400).json({ error: error.message });
            }
        };
        this.taskService = new task_service_1.TaskService();
    }
}
exports.TaskController = TaskController;
