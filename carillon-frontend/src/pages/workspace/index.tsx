import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { placeholder, localPort } from '@/utils/constants'
import { useRouter } from 'next/router'
import SideBar from '@/components/SideBar'

export default function Workspace() {
  const router = useRouter()
  const [workspaceName, setWorkspaceName] = useState('')
  const [workspaceDescription, setWorkspaceDescription] = useState('')

  const handleWorkspaceNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setWorkspaceName(event.target.value)
  }

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setWorkspaceDescription(event.target.value)
  }

  const handleCreateWorkspace = () => {
    const workspaceData = {
      name: workspaceName,
      description: workspaceDescription,
    }

    fetch(`${localPort}/workspaces/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        token: String(localStorage.getItem('token')),
      },
      body: JSON.stringify(workspaceData),
    }).then((response) => {
      if (response.ok) {
        router.push(`/workspace/${workspaceName}`)
      } else {
        console.log('not response.ok')
      }
    })
  }

  return (
    <SideBar>
      <Stack sx={{ paddingTop: 4 }} spacing={2}>
        <Box>
          <Typography sx={{ pb: 2 }} variant="h5">
            Workspace Name
          </Typography>
          <TextField
            sx={{ mt: 2 }}
            fullWidth
            placeholder={placeholder.workspaceName}
            variant="standard"
            value={workspaceName}
            onChange={handleWorkspaceNameChange}
          />
        </Box>
        <Box>
          <Typography sx={{ mt: 2, pb: 2 }} variant="h5">
            Description
          </Typography>
          <TextField
            sx={{ mt: 2 }}
            fullWidth
            placeholder={placeholder.workspaceDescription}
            variant="standard"
            value={workspaceDescription}
            onChange={handleDescriptionChange}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Button
            variant="contained"
            sx={{
              mt: 2,
              width: 300,
              height: 50,
            }}
            onClick={handleCreateWorkspace}
          >
            Create
          </Button>
        </Box>
      </Stack>
    </SideBar>
  )
}
