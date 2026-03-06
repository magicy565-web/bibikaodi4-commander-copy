/**
 * 全局状态管理 - 使用 Zustand
 */
import { create } from 'zustand';

// 员工类型
export type AgentType = 'Scout' | 'Sage' | 'Echo' | 'Muse';

// 任务状态
export type TaskStatus = 'pending' | 'running' | 'done' | 'failed';

// 任务接口
export interface Task {
  id: string;
  title: string;
  agent: AgentType;
  status: TaskStatus;
  progress: number; // 0-100
  result?: string;
  createdAt: number;
  updatedAt: number;
}

interface StoreState {
  // 任务列表
  tasks: Task[];
  
  // 添加任务
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  
  // 更新任务
  updateTask: (id: string, updates: Partial<Task>) => void;
  
  // 删除任务
  removeTask: (id: string) => void;
  
  // 清空所有任务
  clearTasks: () => void;
}

export const useStore = create<StoreState>((set) => ({
  tasks: [
    // 示例任务数据
    {
      id: '1',
      title: '分析沙特市场不锈钢餐具需求',
      agent: 'Scout',
      status: 'done',
      progress: 100,
      result: '已找到 12 家潜在采购商，预估询盘价值 48,000 美元',
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now() - 1800000,
    },
    {
      id: '2',
      title: '生成《沙特基建市场渗透报告》',
      agent: 'Sage',
      status: 'running',
      progress: 65,
      createdAt: Date.now() - 1800000,
      updatedAt: Date.now(),
    },
    {
      id: '3',
      title: '优化 LinkedIn 采购总监触达话术',
      agent: 'Echo',
      status: 'running',
      progress: 42,
      createdAt: Date.now() - 900000,
      updatedAt: Date.now(),
    },
    {
      id: '4',
      title: '生成产品视频脚本',
      agent: 'Muse',
      status: 'pending',
      progress: 0,
      createdAt: Date.now() - 300000,
      updatedAt: Date.now() - 300000,
    },
    {
      id: '5',
      title: '追踪竞品价格变动',
      agent: 'Scout',
      status: 'done',
      progress: 100,
      result: '发现 3 家竞品降价 5-8%，建议调整定价策略',
      createdAt: Date.now() - 7200000,
      updatedAt: Date.now() - 3600000,
    },
  ],
  
  addTask: (task) => set((state) => ({
    tasks: [
      ...state.tasks,
      {
        ...task,
        id: Date.now().toString(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
  })),
  
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id
        ? { ...task, ...updates, updatedAt: Date.now() }
        : task
    ),
  })),
  
  removeTask: (id) => set((state) => ({
    tasks: state.tasks.filter((task) => task.id !== id),
  })),
  
  clearTasks: () => set({ tasks: [] }),
}));
