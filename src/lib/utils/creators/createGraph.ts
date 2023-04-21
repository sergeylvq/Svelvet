import { writable } from 'svelte/store';
import type {
	Graph,
	Node,
	GroupBox,
	EdgeKey,
	GraphKey,
	GroupKey,
	GraphDimensions
} from '$lib/types';
import { createStore } from './createStore';
import { cursorPositionRaw } from '$lib/stores/CursorStore';
import type { WritableEdge, NodeKey } from '$lib/types';
import { createDerivedCursorStore } from './createDerivedCursoreStore';
import { createBoundsStore } from './createBoundsStore';
import type { GraphProps } from '$lib/types';

export function createGraph(id: GraphKey, config: GraphProps): Graph {
	const {
		zoom,
		editable,
		translation: initialTranslation,
		theme,
		direction,
		locked,
		edge
	} = config;

	const translation = {
		x: writable(initialTranslation?.x || 0),
		y: writable(initialTranslation?.y || 0)
	};
	const dimensions = writable({} as GraphDimensions);

	const scale = writable(zoom);

	const nodes = createStore<Node, NodeKey>();
	const bounds = createBoundsStore(nodes, dimensions, scale, translation.x, translation.y);

	const graph: Graph = {
		id,
		nodes,
		edges: createStore<WritableEdge, EdgeKey>(),
		transforms: {
			translation,
			scale
		},
		maxZIndex: writable(2),
		dimensions,
		bounds,
		direction: direction || 'LR',
		editable: editable || false,
		linkingInput: writable(null),
		linkingOutput: writable(null),
		edge: edge || null,
		linkingAny: writable(null),
		editing: writable(null),
		cursor: createDerivedCursorStore(cursorPositionRaw, dimensions, translation, scale),
		locked: writable(locked || false),
		groups: writable({
			selected: { parent: writable(null), nodes: writable(new Set<Node>()) },
			hidden: { parent: writable(null), nodes: writable(new Set<Node>()) }
		}),
		groupBoxes: createStore<GroupBox, GroupKey>(),
		activeGroup: writable(null),
		initialNodePositions: writable([]),
		theme: writable(theme || 'light')
	};

	return graph;
}
