/**
 * Commander Lite — 全局状态管理 v2
 * 新增：资产库状态、决策列表、首页计数器派生值
 * 使用 React Context + useReducer，无需额外依赖
 */
import { createContext, useContext, useReducer, ReactNode } from 'react';

// ─── 类型定义 ────────────────────────────────────────────────

export type TaskStatus = 'pending' | 'running' | 'done' | 'failed';
export type AssetStatus = 'pending' | 'training' | 'active';
export type AssetType = 'product' | 'document' | 'case' | 'media';

export interface Task {
  id: string;
  decisionId: string;
  title: string;
  agentId: string;
  agentName: string;
  status: TaskStatus;
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  result?: string;
  estimatedValue?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  uploadDate: string;
  size: string;
  activationScore: number;
  trainingProgress: number; // 0-100，仅 training 状态使用
}

export interface Decision {
  id: string;
  title: string;
  type: string;
  urgency: 'low' | 'medium' | 'high';
  estimatedValue?: string;
  metrics?: { label: string; value: string }[];
  suggestedAction?: string;
  reasoning?: string;
}

export interface DecisionRecord {
  id: string;
  title: string;
  confirmedAt: Date;
  taskId: string;
}

interface State {
  tasks: Task[];
  assets: Asset[];
  decisions: Decision[];           // 待处理决策列表（供首页计数）
  archivedDecisions: DecisionRecord[];
  // 派生计数（首页用）
  newLeadsCount: number;           // 今日新线索（AI 发现）
  marketSignalsCount: number;      // 市场信号数量
}

type Action =
  | { type: 'DISPATCH_TASK'; payload: Task }
  | { type: 'UPDATE_TASK_PROGRESS'; id: string; progress: number }
  | { type: 'COMPLETE_TASK'; id: string; result: string }
  | { type: 'FAIL_TASK'; id: string }
  | { type: 'ARCHIVE_DECISION'; payload: DecisionRecord }
  | { type: 'REMOVE_DECISION'; id: string }
  | { type: 'ADD_ASSET'; payload: Asset }
  | { type: 'UPDATE_ASSET_STATUS'; id: string; status: AssetStatus; activationScore?: number }
  | { type: 'UPDATE_TRAINING_PROGRESS'; id: string; progress: number }
  | { type: 'INCREMENT_LEADS' }
  | { type: 'INCREMENT_SIGNALS' };

// ─── 初始决策数据（Mock，与 decision-feed 同步） ──────────────

const INITIAL_DECISIONS: Decision[] = [
  {
    id: 'dec-001',
    title: '沙特买家 Ahmed Al-Rashid 高意向信号',
    type: 'lead',
    urgency: 'high',
    estimatedValue: '$28,000',
    metrics: [
      { label: '浏览时长', value: '8 分钟' },
      { label: '访问次数', value: '3 次' },
      { label: '意向评分', value: '94/100' },
    ],
    suggestedAction: '发送个性化 WhatsApp 开场白',
    reasoning: '买家行为数据显示其处于决策窗口期，即时触达成单概率最高。',
  },
  {
    id: 'dec-002',
    title: '巴西市场不锈钢管材采购机会',
    type: 'opportunity',
    urgency: 'medium',
    estimatedValue: '$45,000',
    metrics: [
      { label: '市场规模', value: '$2.3B' },
      { label: '竞争强度', value: '中等' },
      { label: '匹配度', value: '87%' },
    ],
    suggestedAction: '生成《巴西市场进入报告》',
    reasoning: '巴西基建投资增长 18%，不锈钢需求旺盛，当前进入时机最佳。',
  },
  {
    id: 'dec-003',
    title: '中东图册点击率低于行业均值',
    type: 'content',
    urgency: 'low',
    estimatedValue: '+2.1x CTR',
    metrics: [
      { label: '当前点击率', value: '2.3%' },
      { label: '行业均值', value: '4.8%' },
      { label: '优化潜力', value: '高' },
    ],
    suggestedAction: '重新生成中东「沙漠奢华风」产品图册',
    reasoning: '200+ 买家行为数据显示本地化视觉可显著提升点击率。',
  },
];

// ─── 初始资产数据 ─────────────────────────────────────────────

const INITIAL_ASSETS: Asset[] = [
  {
    id: 'asset-001',
    name: '产品目录 2024 Q4',
    type: 'product',
    status: 'active',
    uploadDate: '2024-12-01',
    size: '12.5 MB',
    activationScore: 95,
    trainingProgress: 100,
  },
  {
    id: 'asset-002',
    name: '工厂实力展示视频',
    type: 'media',
    status: 'training',
    uploadDate: '2024-12-08',
    size: '245 MB',
    activationScore: 68,
    trainingProgress: 68,
  },
  {
    id: 'asset-003',
    name: '成功案例 - 沙特项目',
    type: 'case',
    status: 'active',
    uploadDate: '2024-11-15',
    size: '8.3 MB',
    activationScore: 87,
    trainingProgress: 100,
  },
  {
    id: 'asset-004',
    name: '商务合作协议模板',
    type: 'document',
    status: 'pending',
    uploadDate: '2024-12-10',
    size: '2.1 MB',
    activationScore: 0,
    trainingProgress: 0,
  },
];

// ─── 初始状态 ────────────────────────────────────────────────

const initialState: State = {
  tasks: [],
  assets: INITIAL_ASSETS,
  decisions: INITIAL_DECISIONS,
  archivedDecisions: [],
  newLeadsCount: 12,
  marketSignalsCount: 5,
};

// ─── Reducer ─────────────────────────────────────────────────

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'DISPATCH_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };

    case 'UPDATE_TASK_PROGRESS':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.id ? { ...t, progress: action.progress, status: 'running' } : t
        ),
      };

    case 'COMPLETE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.id
            ? { ...t, status: 'done', progress: 100, completedAt: new Date(), result: action.result }
            : t
        ),
      };

    case 'FAIL_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.id ? { ...t, status: 'failed' } : t
        ),
      };

    case 'ARCHIVE_DECISION':
      return {
        ...state,
        archivedDecisions: [action.payload, ...state.archivedDecisions],
      };

    case 'REMOVE_DECISION':
      return {
        ...state,
        decisions: state.decisions.filter(d => d.id !== action.id),
      };

    case 'ADD_ASSET':
      return {
        ...state,
        assets: [action.payload, ...state.assets],
      };

    case 'UPDATE_ASSET_STATUS':
      return {
        ...state,
        assets: state.assets.map(a =>
          a.id === action.id
            ? {
                ...a,
                status: action.status,
                activationScore: action.activationScore ?? a.activationScore,
                trainingProgress: action.status === 'active' ? 100 : a.trainingProgress,
              }
            : a
        ),
      };

    case 'UPDATE_TRAINING_PROGRESS':
      return {
        ...state,
        assets: state.assets.map(a =>
          a.id === action.id
            ? { ...a, trainingProgress: action.progress, activationScore: action.progress }
            : a
        ),
      };

    case 'INCREMENT_LEADS':
      return { ...state, newLeadsCount: state.newLeadsCount + 1 };

    case 'INCREMENT_SIGNALS':
      return { ...state, marketSignalsCount: state.marketSignalsCount + 1 };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────

interface StoreContextValue {
  state: State;
  dispatch: React.Dispatch<Action>;
  /** 确认决策后，自动匹配员工并下发任务 */
  confirmDecision: (decision: {
    id: string;
    title: string;
    type: string;
    estimatedValue?: string;
    suggestedAction?: string;
  }) => Task;
  /** 上传新资产，自动触发训练进度模拟 */
  uploadAsset: (asset: Omit<Asset, 'id' | 'status' | 'activationScore' | 'trainingProgress'>) => void;
  /** 派生计数（首页用） */
  stats: {
    pendingDecisions: number;
    runningTasks: number;
    newLeads: number;
    marketSignals: number;
    activeAgents: number;
  };
}

export const StoreContext = createContext<StoreContextValue | null>(null);

// ─── 员工匹配逻辑 ─────────────────────────────────────────────

const AGENT_SKILL_MAP: Record<string, { agentId: string; agentName: string }> = {
  opportunity: { agentId: '1', agentName: 'Scout · 市场猎手' },
  lead:        { agentId: '3', agentName: 'Echo · 客服专员' },
  content:     { agentId: '4', agentName: 'Muse · 内容创作' },
  optimization:{ agentId: '2', agentName: 'Sage · 策略顾问' },
  alert:       { agentId: '2', agentName: 'Sage · 策略顾问' },
};

const TASK_RESULT_MAP: Record<string, string> = {
  opportunity: '市场渗透报告已生成，识别出 12 家高意向采购商，建议优先联系沙特区域负责人。',
  lead:        '个性化 WhatsApp 开场白已发送，预计 2 小时内获得回复。',
  content:     '中东风格图册已重新生成，预计点击率提升 2.1x。',
  optimization:'流程优化方案已制定，预计节省 30% 的响应时间。',
  alert:       '紧急事项已处理，风险已降低至可控范围。',
};

// ─── Provider ────────────────────────────────────────────────

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ── 派生计数 ────────────────────────────────────────────────
  const stats: StoreContextValue['stats'] = {
    pendingDecisions: state.decisions.length,
    runningTasks: state.tasks.filter(t => t.status === 'running' || t.status === 'pending').length,
    newLeads: state.newLeadsCount,
    marketSignals: state.marketSignalsCount,
    activeAgents: 4, // 固定 4 个数字员工
  };

  // ── confirmDecision ─────────────────────────────────────────
  const confirmDecision: StoreContextValue['confirmDecision'] = (decision) => {
    const agent = AGENT_SKILL_MAP[decision.type] ?? { agentId: '2', agentName: 'Sage · 策略顾问' };
    const task: Task = {
      id: `task-${Date.now()}`,
      decisionId: decision.id,
      title: decision.suggestedAction ?? decision.title,
      agentId: agent.agentId,
      agentName: agent.agentName,
      status: 'pending',
      progress: 0,
      startedAt: new Date(),
      estimatedValue: decision.estimatedValue,
    };

    dispatch({ type: 'DISPATCH_TASK', payload: task });
    dispatch({ type: 'REMOVE_DECISION', id: decision.id });
    dispatch({
      type: 'ARCHIVE_DECISION',
      payload: {
        id: decision.id,
        title: decision.title,
        confirmedAt: new Date(),
        taskId: task.id,
      },
    });

    // 模拟任务进度推进
    const steps = [15, 35, 55, 75, 90, 100];
    steps.forEach((progress, i) => {
      setTimeout(() => {
        if (progress < 100) {
          dispatch({ type: 'UPDATE_TASK_PROGRESS', id: task.id, progress });
        } else {
          dispatch({
            type: 'COMPLETE_TASK',
            id: task.id,
            result: TASK_RESULT_MAP[decision.type] ?? '任务已完成。',
          });
          // 任务完成后，新线索 +1（模拟 AI 发现新商机）
          if (decision.type === 'opportunity' || decision.type === 'lead') {
            setTimeout(() => dispatch({ type: 'INCREMENT_LEADS' }), 1000);
          }
        }
      }, (i + 1) * 2000);
    });

    return task;
  };

  // ── uploadAsset ─────────────────────────────────────────────
  const uploadAsset: StoreContextValue['uploadAsset'] = (assetData) => {
    const asset: Asset = {
      ...assetData,
      id: `asset-${Date.now()}`,
      status: 'pending',
      activationScore: 0,
      trainingProgress: 0,
    };

    dispatch({ type: 'ADD_ASSET', payload: asset });

    // 模拟训练进度：pending → training → active
    // 第 1 秒：开始训练
    setTimeout(() => {
      dispatch({ type: 'UPDATE_ASSET_STATUS', id: asset.id, status: 'training' });
    }, 1000);

    // 训练进度推进（每 2 秒 +10%）
    const progressSteps = [10, 20, 35, 50, 65, 78, 88, 95, 100];
    progressSteps.forEach((progress, i) => {
      setTimeout(() => {
        if (progress < 100) {
          dispatch({ type: 'UPDATE_TRAINING_PROGRESS', id: asset.id, progress });
        } else {
          dispatch({
            type: 'UPDATE_ASSET_STATUS',
            id: asset.id,
            status: 'active',
            activationScore: Math.floor(Math.random() * 15) + 80, // 80-95 随机激活分
          });
        }
      }, 1000 + (i + 1) * 2000);
    });
  };

  return (
    <StoreContext.Provider value={{ state, dispatch, confirmDecision, uploadAsset, stats }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
