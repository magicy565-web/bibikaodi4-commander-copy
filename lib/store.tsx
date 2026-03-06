/**
 * Commander — 全局状态管理
 * 决策中心 → 数字员工 → 任务归档 完整业务闭环
 * 从 bibikaodi4 迁移并适配 commander-mobile
 */
import { createContext, useContext, useReducer, ReactNode } from 'react';

export type TaskStatus = 'pending' | 'running' | 'done' | 'failed';

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

export interface DecisionRecord {
  id: string;
  title: string;
  confirmedAt: Date;
  taskId: string;
}

interface State {
  tasks: Task[];
  archivedDecisions: DecisionRecord[];
}

type Action =
  | { type: 'DISPATCH_TASK'; payload: Task }
  | { type: 'UPDATE_TASK_PROGRESS'; id: string; progress: number }
  | { type: 'COMPLETE_TASK'; id: string; result: string }
  | { type: 'FAIL_TASK'; id: string }
  | { type: 'ARCHIVE_DECISION'; payload: DecisionRecord };

const initialState: State = { tasks: [], archivedDecisions: [] };

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
    default:
      return state;
  }
}

interface StoreContextValue {
  state: State;
  dispatch: React.Dispatch<Action>;
  confirmDecision: (decision: {
    id: string;
    title: string;
    type: string;
    estimatedValue?: string;
    suggestedAction?: string;
  }) => Task;
}

export const StoreContext = createContext<StoreContextValue | null>(null);

const AGENT_SKILL_MAP: Record<string, { agentId: string; agentName: string }> = {
  opportunity:   { agentId: '1', agentName: 'Scout · 市场猎手' },
  lead:          { agentId: '3', agentName: 'Echo · 客服专员' },
  lead_followup: { agentId: '3', agentName: 'Echo · 客服专员' },
  lead_outreach: { agentId: '3', agentName: 'Echo · 客服专员' },
  market_scan:   { agentId: '1', agentName: 'Scout · 市场猎手' },
  content:       { agentId: '4', agentName: 'Muse · 内容创作' },
  content_catalog:{ agentId: '4', agentName: 'Muse · 内容创作' },
  quote_generate:{ agentId: '2', agentName: 'Sage · 策略顾问' },
  inquiry_reply: { agentId: '3', agentName: 'Echo · 客服专员' },
  optimization:  { agentId: '2', agentName: 'Sage · 策略顾问' },
  alert:         { agentId: '2', agentName: 'Sage · 策略顾问' },
};

const TASK_RESULT_MAP: Record<string, string> = {
  opportunity:   '市场渗透报告已生成，识别出 12 家高意向采购商。',
  lead:          '个性化 WhatsApp 开场白已发送，预计 2 小时内获得回复。',
  lead_followup: '买家跟进消息已发送，Echo 正在等待回复。',
  lead_outreach: '新买家开发邮件已发送至 8 家目标企业。',
  market_scan:   '市场扫描完成，发现 5 个高价值商机。',
  content:       '中东风格图册已重新生成，预计点击率提升 2.1x。',
  content_catalog:'产品图册已优化，适配目标市场视觉偏好。',
  quote_generate:'报价单已生成，格式专业，含阶梯价格。',
  inquiry_reply: 'AI 回复草稿已生成，置信度 94%。',
  optimization:  '流程优化方案已制定，预计节省 30% 响应时间。',
  alert:         '紧急事项已处理，风险已降至可控范围。',
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

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
    dispatch({
      type: 'ARCHIVE_DECISION',
      payload: { id: decision.id, title: decision.title, confirmedAt: new Date(), taskId: task.id },
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
        }
      }, (i + 1) * 2000);
    });

    return task;
  };

  return (
    <StoreContext.Provider value={{ state, dispatch, confirmDecision }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
