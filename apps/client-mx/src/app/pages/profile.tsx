import React, { FC } from 'react';
import { observer } from 'mobx-react-lite';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useInjection } from '../bootstrap/ioc/use-injection';
import { IUserManager } from '../store/interfaces';
import { DependencyType } from '../bootstrap/ioc/dependency-type';

const Profile: FC = observer(() => {
  const { userData } = useInjection<IUserManager>(DependencyType.UserManager);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Profile
        </Typography>
        <Typography sx={{ mb: 3 }} color="text.secondary">
          Readonly on this development iteration
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Name"
            value={userData?.name || ''}
            slotProps={{ input: { readOnly: true } }}
            fullWidth
            disabled
          />
          <TextField
            label="Email"
            value={userData?.email || ''}
            slotProps={{ input: { readOnly: true } }}
            fullWidth
            disabled
          />
          <Typography variant="body1">Role: {userData?.role}</Typography>
          <FormControlLabel
            control={<Checkbox checked={userData?.email_verified} disabled />}
            label="Email verified"
          />
        </Box>
      </Box>
    </Container>
  );
});

export default Profile;
