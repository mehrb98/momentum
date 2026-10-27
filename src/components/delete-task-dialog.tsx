"use client";

import { AlertDialog, Button } from "@heroui/react";
import type { DeleteTaskDialogProps } from "@/types/task.types";

export function DeleteTaskDialog({ isOpen, kind, name, onCancel, onConfirm }: DeleteTaskDialogProps) {
    if (!isOpen) return null;

    return (
        <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && onCancel()}>
            <AlertDialog.Container size="sm" placement="center">
                <AlertDialog.Dialog>
                    <AlertDialog.CloseTrigger />
                    
                    <AlertDialog.Header>
                        <AlertDialog.Icon status="danger" />
                        <AlertDialog.Heading>Delete {kind}?</AlertDialog.Heading>
                    </AlertDialog.Header>
                    
                    <AlertDialog.Body>
                        “{name}” will be permanently removed. This can’t be undone.
                    </AlertDialog.Body>
                    
                    <AlertDialog.Footer>
                        <Button variant="tertiary" onPress={onCancel}>
                            Cancel
                        </Button>
                        
                        <Button variant="danger" onPress={onConfirm}>
                            Delete
                        </Button>
                    </AlertDialog.Footer>
                </AlertDialog.Dialog>
            </AlertDialog.Container>
        </AlertDialog.Backdrop>
    );
}
