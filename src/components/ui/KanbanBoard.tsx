"use client";

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useState } from 'react';
import { Settings, CheckCircle, XCircle } from 'lucide-react';

export interface ColumnData {
    id: string;
    title: string;
    itemIds: string[];
}

interface KanbanBoardProps {
    initialColumns: Record<string, ColumnData>;
    items: Record<string, { id: string; content: string; type?: string }>;
    onDragEndAction?: (result: DropResult) => void;
}

export function KanbanBoard({ initialColumns, items, onDragEndAction }: KanbanBoardProps) {
    const [columns, setColumns] = useState(initialColumns);

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) {
            return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        const startColumn = columns[source.droppableId];
        const finishColumn = columns[destination.droppableId];

        if (startColumn === finishColumn) {
            // Sorting in same column
            const newItemIds = Array.from(startColumn.itemIds);
            newItemIds.splice(source.index, 1);
            newItemIds.splice(destination.index, 0, draggableId);

            const newColumn = {
                ...startColumn,
                itemIds: newItemIds,
            };

            setColumns({
                ...columns,
                [newColumn.id]: newColumn,
            });
            return;
        }

        // Moving to different column
        const startItemIds = Array.from(startColumn.itemIds);
        startItemIds.splice(source.index, 1);
        const newStart = {
            ...startColumn,
            itemIds: startItemIds,
        };

        const finishItemIds = Array.from(finishColumn.itemIds);
        finishItemIds.splice(destination.index, 0, draggableId);
        const newFinish = {
            ...finishColumn,
            itemIds: finishItemIds,
        };

        setColumns({
            ...columns,
            [newStart.id]: newStart,
            [newFinish.id]: newFinish,
        });

        if (onDragEndAction) {
            onDragEndAction(result);
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', padding: '16px 4px' }}>
                {Object.values(columns).map((column) => (
                    <div key={column.id} style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        width: '320px',
                        minWidth: '320px',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <h3 style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontSize: '1rem', fontWeight: '600', color: 'var(--foreground)' }}>
                            {column.title}  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '8px' }}>{column.itemIds.length}</span>
                        </h3>
                        <Droppable droppableId={column.id}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    style={{
                                        padding: '16px',
                                        minHeight: '200px',
                                        background: snapshot.isDraggingOver ? 'var(--background)' : 'transparent',
                                        flexGrow: 1,
                                        transition: 'background-color 0.2s ease',
                                        borderBottomLeftRadius: '12px',
                                        borderBottomRightRadius: '12px'
                                    }}
                                >
                                    {column.itemIds.map((itemId, index) => {
                                        const item = items[itemId];
                                        return (
                                            <Draggable key={itemId} draggableId={itemId} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="card"
                                                        style={{
                                                            marginBottom: '12px',
                                                            padding: '16px',
                                                            background: snapshot.isDragging ? 'var(--surface)' : 'white',
                                                            boxShadow: snapshot.isDragging ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                                                            ...provided.draggableProps.style,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            gap: '12px',
                                                            border: snapshot.isDragging ? '1px solid var(--primary)' : '1px solid var(--border)'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <Settings size={18} style={{ color: 'var(--text-muted)' }} />
                                                            <span style={{ fontWeight: 500 }}>{item.content}</span>
                                                        </div>
                                                        {column.id === 'enabled' && <CheckCircle size={16} color="green" />}
                                                        {column.id === 'disabled' && <XCircle size={16} color="red" />}
                                                    </div>
                                                )}
                                            </Draggable>
                                        );
                                    })}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>
        </DragDropContext>
    );
}
