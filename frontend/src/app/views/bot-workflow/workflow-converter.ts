import type { WorkflowDefinition } from '../../core/types';
import { NODE_TYPES, MindMapNode } from './node-configs';

// 获取默认思维导图数据
export function getDefaultMindMapData(): MindMapNode {
    return {
        data: {
            text: '订单触发',
            uid: 'trigger',
            nodeType: 'trigger',
            fillColor: NODE_TYPES.trigger.color,
            borderColor: NODE_TYPES.trigger.color,
            fontColor: '#ffffff'
        },
        children: []
    };
}

// 获取默认流程模板
export function getDefaultWorkflowTemplate(): MindMapNode {
    return {
        data: {
            text: '订单触发',
            uid: 'trigger',
            nodeType: 'trigger',
            fillColor: NODE_TYPES.trigger.color,
            borderColor: NODE_TYPES.trigger.color,
            fontColor: '#ffffff'
        },
        children: [
            {
                data: {
                    text: '发货',
                    uid: 'delivery_1',
                    nodeType: 'delivery',
                    fillColor: NODE_TYPES.delivery.color,
                    borderColor: NODE_TYPES.delivery.color,
                    fontColor: '#ffffff'
                },
                children: [
                    {
                        data: {
                            text: '标记发货',
                            uid: 'ship_1',
                            nodeType: 'ship',
                            fillColor: NODE_TYPES.ship.color,
                            borderColor: NODE_TYPES.ship.color,
                            fontColor: '#ffffff'
                        }
                    }
                ]
            }
        ]
    };
}

// WorkflowDefinition -> MindMapNode
export function definitionToMindMap(def: WorkflowDefinition): MindMapNode {
    if (!def?.nodes?.length) {
        return getDefaultMindMapData();
    }

    const nodeMap = new Map<string, MindMapNode>();
    const childrenMap = new Map<string, string[]>();

    def.nodes.forEach(n => {
        const typeConfig = NODE_TYPES[n.type as keyof typeof NODE_TYPES];
        nodeMap.set(n.id, {
            data: {
                text: n.name,
                uid: n.id,
                nodeType: n.type,
                config: n.config,
                fillColor: typeConfig?.color,
                borderColor: typeConfig?.color,
                fontColor: '#ffffff'
            },
            children: []
        });
        childrenMap.set(n.id, []);
    });

    def.connections.forEach(c => {
        const children = childrenMap.get(c.fromNode);
        if (children) {
            children.push(c.toNode);
        }
    });

    childrenMap.forEach((childIds, parentId) => {
        const parent = nodeMap.get(parentId);
        if (parent) {
            parent.children = childIds
                .map(id => nodeMap.get(id))
                .filter(Boolean) as MindMapNode[];
        }
    });

    const rootNode = def.nodes.find(n => n.type === 'trigger');
    return rootNode ? nodeMap.get(rootNode.id)! : getDefaultMindMapData();
}

// MindMapNode -> WorkflowDefinition
export function mindMapToDefinition(data: MindMapNode | null): WorkflowDefinition {
    if (!data) {
        return { nodes: [], connections: [] };
    }

    const nodes: WorkflowDefinition['nodes'] = [];
    const connections: WorkflowDefinition['connections'] = [];

    const traverse = (node: MindMapNode, parentId?: string) => {
        const id = node.data.uid || `node_${Date.now()}_${Math.random()}`;
        nodes.push({
            id,
            type: (node.data.nodeType || 'delivery') as any,
            name: node.data.text,
            config: node.data.config || {},
            posX: 0,
            posY: 0
        });

        if (parentId) {
            connections.push({
                fromNode: parentId,
                fromOutput: 'output_1',
                toNode: id,
                toInput: 'input_1'
            });
        }

        node.children?.forEach(child => traverse(child, id));
    };

    traverse(data);
    return { nodes, connections };
}
