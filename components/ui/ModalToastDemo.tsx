// Demo component to showcase Modal and Toast functionality
// This can be used for testing or as a reference for implementation

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { useToasts } from '@/components/ui/Toast';

export function ModalToastDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { success, error, warning, info } = useToasts();

  const showSuccessToast = () => {
    success('Success!', 'Your action was completed successfully.');
  };

  const showErrorToast = () => {
    error('Error!', 'Something went wrong. Please try again.');
  };

  const showWarningToast = () => {
    warning('Warning!', 'Please review your input before proceeding.');
  };

  const showInfoToast = () => {
    info('Information', 'Here is some useful information for you.');
  };

  const showToastWithAction = () => {
    success('Action Required', 'Please review the changes.', {
      action: {
        label: 'Review',
        onClick: () => console.log('Action clicked'),
      },
    });
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Modal & Toast Demo</h2>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Toast examples</h3>
        <div className="flex flex-wrap gap-2">
          <Button onClick={showSuccessToast} variant="default" size="sm">
            Success toast
          </Button>
          <Button onClick={showErrorToast} variant="secondary" size="sm">
            Error toast
          </Button>
          <Button onClick={showWarningToast} variant="secondary" size="sm">
            Warning toast
          </Button>
          <Button onClick={showInfoToast} variant="secondary" size="sm">
            Info toast
          </Button>
          <Button onClick={showToastWithAction} variant="outline" size="sm">
            Toast with Action
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Modal Examples</h3>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsModalOpen(true)} variant="default" size="sm">
            Open Basic Modal
          </Button>
          <Button onClick={() => setIsConfirmOpen(true)} variant="outline" size="sm">
            Open Confirm Modal
          </Button>
        </div>
      </div>

      {/* Basic Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Demo Modal"
        description="This is a demonstration of the modal component."
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            This modal demonstrates the new reusable modal component with proper accessibility,
            keyboard navigation, and responsive design.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setIsModalOpen(false);
              success('Modal Action', 'You clicked the confirm button!');
            }}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Action"
        description="Are you sure you want to perform this action? This cannot be undone."
        confirmText="Yes, I'm sure"
        cancelText="Cancel"
        onConfirm={() => {
          setIsConfirmOpen(false);
          warning('Action Confirmed', 'The action has been performed.');
        }}
      />
    </div>
  );
}
