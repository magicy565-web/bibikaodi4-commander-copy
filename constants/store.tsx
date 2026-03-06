/**
 * Commander — 全局状态管理
 * 基于卡贝奇（KABEQ）真实产品数据构建演示场景
 * 品牌定位：Crafting High-End Aesthetic Furniture for Young People
 */
import { createContext, useContext, useReducer, ReactNode } from 'react';

// ─── 类型定义 ────────────────────────────────────────────────

export type TaskStatus = 'pending' | 'running' | 'done' | 'failed';
export type AssetStatus = 'pending' | 'training' | 'active';
export type AssetType = 'product' | 'document' | 'case' | 'media' | 'certificate';

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
  nameEn?: string;
  type: AssetType;
  status: AssetStatus;
  uploadDate: string;
  size: string;
  activationScore: number;
  trainingProgress: number;
  description?: string;
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
  market?: string;
  buyer?: string;
}

export interface DecisionRecord {
  id: string;
  title: string;
  confirmedAt: Date;
  taskId: string;
}

// CRM 客户类型
export type CustomerStage = 'prospecting' | 'inquiry' | 'quote' | 'sample' | 'closed';
export type CustomerUrgency = 'urgent' | 'followup' | 'healthy';

export interface Customer {
  id: string;
  name: string;
  company: string;
  country: string;
  flag: string;
  stage: CustomerStage;
  urgency: CustomerUrgency;
  urgencyScore: number;
  lastContact: string;
  aiInsight: string;
  budget?: string;
  products?: string[];
  // 会议辅助
  meetingSuggestions?: {
    opener: string;
    keyPoint: string;
    objection: string;
    goal: string;
  };
  // 跟进时间线
  timeline?: { date: string; action: string; note: string }[];
  // 采购意图雷达（0-100）
  intentRadar?: {
    price: number;
    quality: number;
    delivery: number;
    certification: number;
    customization: number;
  };
}

interface State {
  tasks: Task[];
  assets: Asset[];
  decisions: Decision[];
  archivedDecisions: DecisionRecord[];
  customers: Customer[];
  newLeadsCount: number;
  marketSignalsCount: number;
  todayInquiries: number;
  totalPipelineValue: string;
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
  | { type: 'INCREMENT_SIGNALS' }
  | { type: 'UPDATE_CUSTOMER_STAGE'; id: string; stage: CustomerStage };

// ─── 初始决策数据（基于卡贝奇真实产品场景） ──────────────────

const INITIAL_DECISIONS: Decision[] = [
  {
    id: 'dec-001',
    title: 'Ahmed 询盘：KS-837 岩石沙发 200 套',
    type: 'lead',
    urgency: 'high',
    estimatedValue: '$58,400',
    market: '中东 · 沙特',
    buyer: 'Ahmed Al-Rashid',
    metrics: [
      { label: '采购数量', value: '200 套' },
      { label: '斋月窗口', value: '23 天' },
      { label: '意向评分', value: '94/100' },
    ],
    suggestedAction: '生成个性化英文报价 + WhatsApp 开场白',
    reasoning: 'Ahmed 已浏览 KS-837 页面 3 次，斋月季前采购窗口期紧迫，即时触达成单概率最高。出厂价 ¥3,260/套，FOB 报价约 $292/套，200 套总价 $58,400。',
  },
  {
    id: 'dec-002',
    title: '迪拜市场：奢华皮革沙发需求激增 +34%',
    type: 'opportunity',
    urgency: 'medium',
    estimatedValue: '$120,000',
    market: '中东 · UAE',
    metrics: [
      { label: '市场增速', value: '+34% YoY' },
      { label: '目标产品', value: 'KS-801/KS-850' },
      { label: '潜在买家', value: '12 家' },
    ],
    suggestedAction: '生成《迪拜高端皮革家具市场进入报告》',
    reasoning: '迪拜 2025 年豪宅竣工量创历史新高，高端皮革沙发需求激增。KS-801 大黑牛和 KS-850 黑糖与当地审美高度匹配。',
  },
  {
    id: 'dec-003',
    title: '中东图册点击率低于行业均值 2.1x',
    type: 'content',
    urgency: 'low',
    estimatedValue: '+2.1x CTR',
    market: '中东',
    metrics: [
      { label: '当前点击率', value: '2.3%' },
      { label: '行业均值', value: '4.8%' },
      { label: '涉及产品', value: 'KS-837/KS-824' },
    ],
    suggestedAction: '重新生成「沙漠奢华风」KS-837 阿拉伯语图册',
    reasoning: '分析 200+ 中东买家行为数据，本地化视觉（暖金色调 + 阿拉伯文标注）可将点击率提升至行业均值以上。',
  },
];

// ─── 初始资产数据（卡贝奇真实资产） ──────────────────────────

const INITIAL_ASSETS: Asset[] = [
  {
    id: 'asset-001',
    name: 'KABEQ 2025 新品报价单',
    nameEn: 'KABEQ 2025 New Product Price List',
    type: 'product',
    status: 'active',
    uploadDate: '2025-01-15',
    size: '18.6 MB',
    activationScore: 95,
    trainingProgress: 100,
    description: '73页完整产品图册，含沙发/休闲椅/桌几全系列，AI 已提取 156 个产品知识节点',
  },
  {
    id: 'asset-002',
    name: 'KS-837 岩石沙发工厂实拍视频',
    nameEn: 'KS-837 Rock Sofa Factory Video',
    type: 'media',
    status: 'training',
    uploadDate: '2025-02-20',
    size: '312 MB',
    activationScore: 68,
    trainingProgress: 68,
    description: '工厂生产流程 + 品质检验 + 成品展示，AI 正在提取视觉卖点',
  },
  {
    id: 'asset-003',
    name: '沙特 Al-Futtaim 交付案例',
    nameEn: 'Saudi Al-Futtaim Delivery Case Study',
    type: 'case',
    status: 'active',
    uploadDate: '2024-11-08',
    size: '5.2 MB',
    activationScore: 92,
    trainingProgress: 100,
    description: '200 套 KS-837 成功交付，含质检报告/物流记录/客户好评，可作为中东市场背书',
  },
  {
    id: 'asset-004',
    name: 'ISO 9001 质量管理体系认证',
    nameEn: 'ISO 9001 Quality Management Certificate',
    type: 'certificate',
    status: 'active',
    uploadDate: '2024-06-01',
    size: '1.8 MB',
    activationScore: 100,
    trainingProgress: 100,
    description: '2024-2027 有效期，覆盖沙发/椅子/桌几全产品线，中东买家必查文件',
  },
  {
    id: 'asset-005',
    name: '中东市场定制能力说明书',
    nameEn: 'Middle East Customization Capability Deck',
    type: 'document',
    status: 'pending',
    uploadDate: '2025-03-01',
    size: '3.4 MB',
    activationScore: 0,
    trainingProgress: 0,
    description: '颜色/尺寸/面料/包装定制方案，针对中东市场特别制作，待 AI 激活',
  },
];

// ─── 初始 CRM 客户数据（卡贝奇外贸场景） ─────────────────────

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-001',
    name: 'Ahmed Al-Rashid',
    company: 'Al-Futtaim Home Group',
    country: '沙特阿拉伯',
    flag: '🇸🇦',
    stage: 'inquiry',
    urgency: 'urgent',
    urgencyScore: 94,
    lastContact: '2小时前',
    aiInsight: '斋月季采购预算 $180K，窗口期仅剩 23 天，建议今日回复',
    budget: '$180,000',
    products: ['KS-837 岩石沙发 ×200', 'KS-801 大黑牛 ×50'],
    meetingSuggestions: {
      opener: '提及上次 Al-Futtaim 200 套成功交付，建立信任基础',
      keyPoint: '强调 KS-837 的 C 级布艺可定制沙漠金/皇家蓝，ISO 9001 认证保障品质',
      objection: '预计对交货期提出异议 → 回应：备货充足，30 天内可 FOB 装柜',
      goal: '争取签订 200 套 KS-837 + 50 套 KS-801 意向合同',
    },
    timeline: [
      { date: '03-06', action: '询盘', note: 'Ahmed 发来询盘：KS-837 × 200套，要求 FOB 报价和认证文件' },
      { date: '03-04', action: '浏览', note: 'AI 检测到 Ahmed 浏览产品页 3 次，停留 8 分钟' },
      { date: '02-28', action: '展会', note: '迪拜家具展初次见面，交换名片，对岩石沙发感兴趣' },
    ],
    intentRadar: { price: 55, quality: 90, delivery: 85, certification: 95, customization: 75 },
  },
  {
    id: 'cust-002',
    name: 'Priya Sharma',
    company: 'HomeStyle India Pvt. Ltd.',
    country: '印度',
    flag: '🇮🇳',
    stage: 'quote',
    urgency: 'followup',
    urgencyScore: 78,
    lastContact: '1天前',
    aiInsight: '年采购额 $2M+，价格敏感但重视认证，强调 FOB 价格优势可提升成单率',
    budget: '$95,000',
    products: ['KA-002 毛毛虫 ×500', 'KA-024 螃蟹椅 ×300'],
    meetingSuggestions: {
      opener: '提及印度年轻消费市场对设计感家具的需求增长，引发共鸣',
      keyPoint: '毛毛虫和螃蟹椅在 Instagram 印度区爆款，提供社媒数据支撑',
      objection: '预计对 MOQ 提出异议 → 回应：首单可降至 200 套，建立合作后再扩量',
      goal: '确认报价单，推进样品订单',
    },
    timeline: [
      { date: '03-05', action: '报价', note: 'AI 生成 FOB 报价单已发送，等待 Priya 确认' },
      { date: '03-03', action: '询盘', note: 'Priya 询问 KA-002 和 KA-024 的 MOQ 和 FOB 价格' },
      { date: '02-25', action: '线索', note: 'Scout AI 在 LinkedIn 发现 Priya，年采购额 $2M+' },
    ],
    intentRadar: { price: 85, quality: 70, delivery: 65, certification: 60, customization: 45 },
  },
  {
    id: 'cust-003',
    name: 'Fatima Al-Zahra',
    company: 'Dubai Home Decor LLC',
    country: '阿联酋',
    flag: '🇦🇪',
    stage: 'sample',
    urgency: 'healthy',
    urgencyScore: 62,
    lastContact: '3天前',
    aiInsight: '样品已寄出 12 天，建议主动询问反馈，高复购率客户值得深度维护',
    budget: '$45,000',
    products: ['KS-824 云沙发 ×100', 'KC-004 茶几 ×100'],
    meetingSuggestions: {
      opener: '询问样品收货体验，表达对合作的重视',
      keyPoint: 'KS-824 云沙发的极简美学与迪拜高端公寓装修风格高度契合',
      objection: '预计对颜色选择提出异议 → 回应：提供 12 种面料色卡，支持定制',
      goal: '获取样品反馈，推进正式订单',
    },
    timeline: [
      { date: '03-03', action: '样品', note: 'KS-824 云沙发样品已 DHL 发出，单号 1234567890' },
      { date: '02-28', action: '确认', note: 'Fatima 确认样品规格：米白色，2200mm 三人位' },
      { date: '02-20', action: '询盘', note: 'Fatima 通过阿里巴巴发来询盘，对云沙发感兴趣' },
    ],
    intentRadar: { price: 60, quality: 85, delivery: 70, certification: 65, customization: 80 },
  },
];

// ─── 初始状态 ────────────────────────────────────────────────

const initialState: State = {
  tasks: [],
  assets: INITIAL_ASSETS,
  decisions: INITIAL_DECISIONS,
  archivedDecisions: [],
  customers: INITIAL_CUSTOMERS,
  newLeadsCount: 12,
  marketSignalsCount: 5,
  todayInquiries: 3,
  totalPipelineValue: '$323,400',
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
      return { ...state, newLeadsCount: state.newLeadsCount + 1, todayInquiries: state.todayInquiries + 1 };

    case 'INCREMENT_SIGNALS':
      return { ...state, marketSignalsCount: state.marketSignalsCount + 1 };

    case 'UPDATE_CUSTOMER_STAGE':
      return {
        ...state,
        customers: state.customers.map(c =>
          c.id === action.id ? { ...c, stage: action.stage } : c
        ),
      };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────

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
  uploadAsset: (asset: Omit<Asset, 'id' | 'status' | 'activationScore' | 'trainingProgress'>) => void;
  stats: {
    pendingDecisions: number;
    runningTasks: number;
    newLeads: number;
    marketSignals: number;
    activeAgents: number;
    todayInquiries: number;
    totalPipelineValue: string;
  };
}

export const StoreContext = createContext<StoreContextValue | null>(null);

// ─── 员工匹配逻辑（卡贝奇外贸场景） ──────────────────────────

const AGENT_SKILL_MAP: Record<string, { agentId: string; agentName: string }> = {
  opportunity: { agentId: '1', agentName: 'Scout · 市场猎手' },
  lead:        { agentId: '3', agentName: 'Echo · 客服专员' },
  content:     { agentId: '4', agentName: 'Muse · 内容创作' },
  optimization:{ agentId: '2', agentName: 'Sage · 策略顾问' },
  alert:       { agentId: '2', agentName: 'Sage · 策略顾问' },
};

const TASK_RESULT_MAP: Record<string, string> = {
  opportunity: '《迪拜高端皮革家具市场进入报告》已生成，识别出 12 家高意向采购商，KS-801 大黑牛和 KS-850 黑糖为重点推广产品。',
  lead:        'Ahmed Al-Rashid 英文报价邮件已发送，含 KS-837 FOB 报价 $292/套、ISO 9001 认证文件和定制色卡。预计 24 小时内获得回复。',
  content:     '「沙漠奢华风」KS-837 阿拉伯语图册已重新生成，暖金色调 + 阿拉伯文标注，预计点击率提升 2.1x。',
  optimization:'斋月季报价策略已制定：建议对 200 套以上订单给予 8% 折扣，可提升成单率 35%。',
  alert:       '紧急事项已处理，风险已降低至可控范围。',
};

// ─── Provider ────────────────────────────────────────────────

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const stats: StoreContextValue['stats'] = {
    pendingDecisions: state.decisions.length,
    runningTasks: state.tasks.filter(t => t.status === 'running' || t.status === 'pending').length,
    newLeads: state.newLeadsCount,
    marketSignals: state.marketSignalsCount,
    activeAgents: 4,
    todayInquiries: state.todayInquiries,
    totalPipelineValue: state.totalPipelineValue,
  };

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
          if (decision.type === 'opportunity' || decision.type === 'lead') {
            setTimeout(() => dispatch({ type: 'INCREMENT_LEADS' }), 1000);
          }
        }
      }, (i + 1) * 2000);
    });

    return task;
  };

  const uploadAsset: StoreContextValue['uploadAsset'] = (assetData) => {
    const asset: Asset = {
      ...assetData,
      id: `asset-${Date.now()}`,
      status: 'pending',
      activationScore: 0,
      trainingProgress: 0,
    };

    dispatch({ type: 'ADD_ASSET', payload: asset });

    setTimeout(() => {
      dispatch({ type: 'UPDATE_ASSET_STATUS', id: asset.id, status: 'training' });
    }, 1000);

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
            activationScore: Math.floor(Math.random() * 15) + 80,
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

// ─── Hook ─────────────────────────────────────────────────────

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
