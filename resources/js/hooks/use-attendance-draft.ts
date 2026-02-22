import { useState, useCallback, useEffect } from 'react';

export interface AttendanceState {
    status: string;
    is_installment_due: boolean;
}

export type GroupAttendanceState = Record<number, AttendanceState>;
export type FullAttendanceState = Record<number, GroupAttendanceState>;

interface Student {
    id: number;
}

interface Group {
    id: number;
    students: Student[];
    lecture_session?: {
        attendances: Array<{
            student_id: number;
            status: string;
            is_installment_due: boolean;
        }>;
    };
}

export function useAttendanceDraft(selectedDate: string, groups: Group[]) {
    const getStorageKey = useCallback((date: string) => `attendance_draft_${date}`, []);

    const calculateInitialState = useCallback((groupsList: Group[], date: string) => {
        const state: FullAttendanceState = {};
        const savedDraft = localStorage.getItem(getStorageKey(date));
        const draftData = savedDraft ? JSON.parse(savedDraft) : {};

        groupsList.forEach((group) => {
            state[group.id] = {};
            
            // Map existing attendances for O(1) lookup
            const existingAttendances = (group.lecture_session?.attendances || []).reduce((acc, a) => {
                acc[a.student_id] = a;
                return acc;
            }, {} as Record<number, { status: string; is_installment_due: boolean }>);

            group.students.forEach((student) => {
                const draft = draftData[group.id]?.[student.id];
                const existing = existingAttendances[student.id];

                state[group.id][student.id] = {
                    status: draft ? draft.status : (existing ? existing.status : 'absent'),
                    is_installment_due: draft
                        ? draft.is_installment_due
                        : (existing ? existing.is_installment_due : false),
                };
            });
        });
        return state;
    }, [getStorageKey]);

    const [localAttendances, setLocalAttendances] = useState<FullAttendanceState>(() => 
        calculateInitialState(groups, selectedDate)
    );

    // Update state when groups or date changes
    useEffect(() => {
        setLocalAttendances(calculateInitialState(groups, selectedDate));
    }, [groups, selectedDate, calculateInitialState]);

    const saveToLocalStorage = useCallback((groupId: number, groupState: GroupAttendanceState) => {
        const key = getStorageKey(selectedDate);
        const savedDraft = localStorage.getItem(key);
        const draftData = savedDraft ? JSON.parse(savedDraft) : {};
        draftData[groupId] = groupState;
        localStorage.setItem(key, JSON.stringify(draftData));
    }, [selectedDate, getStorageKey]);

    const updateStatus = useCallback((groupId: number, studentId: number, status: string) => {
        if (!status) return;
        setLocalAttendances((prev) => {
            const newGroupState = {
                ...prev[groupId],
                [studentId]: {
                    ...prev[groupId][studentId],
                    status,
                },
            };
            saveToLocalStorage(groupId, newGroupState);
            return {
                ...prev,
                [groupId]: newGroupState,
            };
        });
    }, [saveToLocalStorage]);

    const updateInstallment = useCallback((groupId: number, studentId: number, checked: boolean) => {
        setLocalAttendances((prev) => {
            const newGroupState = {
                ...prev[groupId],
                [studentId]: {
                    ...prev[groupId][studentId],
                    is_installment_due: checked,
                },
            };
            saveToLocalStorage(groupId, newGroupState);
            return {
                ...prev,
                [groupId]: newGroupState,
            };
        });
    }, [saveToLocalStorage]);

    const clearGroupDraft = useCallback((groupId: number) => {
        const key = getStorageKey(selectedDate);
        const savedDraft = localStorage.getItem(key);
        if (savedDraft) {
            const draftData = JSON.parse(savedDraft);
            delete draftData[groupId];

            if (Object.keys(draftData).length === 0) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, JSON.stringify(draftData));
            }
        }
    }, [selectedDate, getStorageKey]);

    return {
        localAttendances,
        updateStatus,
        updateInstallment,
        clearGroupDraft,
    };
}
