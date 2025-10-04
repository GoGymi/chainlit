import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { IconButton } from '@mui/material';

import { useDeleteThread } from '../hooks/useDeleteThread';

interface DeleteThreadButtonProps {
  threadId: string;
  onDelete: () => void;
}

export const DeleteThreadButton = ({
  threadId,
  onDelete
}: DeleteThreadButtonProps) => {
  const deleteMutation = useDeleteThread();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent thread selection
    e.preventDefault();

    if (!confirm('Delete this conversation?')) return;

    deleteMutation.mutate(threadId, {
      onSuccess: () => {
        onDelete(); // Call callback after successful deletion
      }
    });
  };

  return (
    <IconButton
      size="small"
      onClick={handleDelete}
      disabled={deleteMutation.isPending}
      sx={{
        opacity: 0,
        transition: 'opacity 0.2s',
        '.MuiStack-root:hover &': { opacity: 1 }, // Show on parent hover
        p: 0.5
      }}
    >
      <DeleteIcon sx={{ width: 12, height: 12 }} />
    </IconButton>
  );
};
