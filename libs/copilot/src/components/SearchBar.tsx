import { useState } from 'react';

import SearchIcon from '@mui/icons-material/Search';
import { InputBase, Stack } from '@mui/material';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onSearch(newValue);
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        bgcolor: 'background.default',
        borderRadius: 1,
        px: 1.5,
        py: 0.75,
        mb: 1
      }}
    >
      <SearchIcon
        sx={{ width: 14, height: 14, mr: 1, color: 'text.secondary' }}
      />
      <InputBase
        placeholder="Search conversations..."
        value={value}
        onChange={handleChange}
        sx={{
          fontSize: '11px',
          flexGrow: 1,
          '& input::placeholder': {
            fontSize: '11px'
          }
        }}
      />
    </Stack>
  );
};
