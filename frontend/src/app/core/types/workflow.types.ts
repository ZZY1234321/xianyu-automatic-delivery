/**
 * 发货流程相关类型定义
 */

export type WorkflowNodeType =
    | 'trigger'
    | 'autoreply'
    | 'delivery'
    | 'ship'
    | 'delay'
    | 'condition'

export interface WorkflowNode {
    id: string
    type: WorkflowNodeType
    name: string
    config: {
        autoReplyRuleId?: number
        expectedKeywords?: string[]
        delaySeconds?: number
        condition?: string
        expression?: string
    }
    posX: number
    posY: number
}

export interface WorkflowConnection {
    fromNode: string
    fromOutput: string
    toNode: string
    toInput: string
}

export interface WorkflowDefinition {
    nodes: WorkflowNode[]
    connections: WorkflowConnection[]
}

export interface Workflow {
    id: number
    name: string
    description: string | null
    definition: WorkflowDefinition
    isDefault: boolean
    enabled: boolean
    createdAt: string
    updatedAt: string
}

// 节点类型配置
export const WORKFLOW_NODE_TYPES: Record<WorkflowNodeType, {
    label: string
    color: string
    inputs: number
    outputs: number
}> = {
    trigger: { label: '触发', color: '#22c55e', inputs: 0, outputs: 1 },
    autoreply: { label: '自动回复', color: '#3b82f6', inputs: 1, outputs: 2 },
    delivery: { label: '发货', color: '#f59e0b', inputs: 1, outputs: 1 },
    ship: { label: '标记发货', color: '#8b5cf6', inputs: 1, outputs: 0 },
    delay: { label: '延迟', color: '#6b7280', inputs: 1, outputs: 1 },
    condition: { label: '条件', color: '#ec4899', inputs: 1, outputs: 2 }
}
