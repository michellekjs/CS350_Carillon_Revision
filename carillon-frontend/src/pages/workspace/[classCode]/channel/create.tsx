/* eslint-disable no-underscore-dangle */
import React, { useState, ChangeEvent } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { placeholder, localPort } from '@/utils/constants'
import { IUser, IWorkspace } from '@/utils/types'
import { useRouter } from 'next/router'
import SideBar from '@/components/SideBar'

interface ChannelProps {
  users: IUser[]
  workspaces: IWorkspace[]
}

export default function Channel({ users, workspaces }: ChannelProps) {
  const router = useRouter()
  const [channelName, setChannelName] = useState('')
  const [channelDescription, setchannelDescription] = useState('')
  const [searchResults, setSearchResults] = useState<IUser[]>([])
  const [selectedMembers, setSelectedMembers] = useState<IUser[]>([])
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  let cur = workspaces[0]
  for (let i = 0; i < workspaces.length; i += 1) {
    if (workspaces[i].name === router.query.classCode) {
      cur = workspaces[i]
    }
  }

  const handleAddMember = (member: IUser) => {
    if (!selectedMembers.includes(member)) {
      setSelectedMembers((prevMembers) => [...prevMembers, member])
    }
  }

  const handleSearchQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value
    setSearchQuery(query)

    const matchedUser = users.find(
      (user) => user.userId.toLowerCase() === query.toLowerCase(),
    )

    const matchedUsers = users.filter((user) =>
      user.userId.toLowerCase().includes(query.toLowerCase()),
    )

    setSearchResults(matchedUsers.slice(0, 5))

    if (matchedUser && !selectedMembers.includes(matchedUser)) {
      setSelectedMembers((prevMembers) => [...prevMembers, matchedUser])
    }
  }

  const handleChannelNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setChannelName(event.target.value)
  }

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setchannelDescription(event.target.value)
  }

  const handleCreateChannel = () => {
    const channelData = {
      name: channelName,
      description: channelDescription,
      // eslint-disable-next-line no-underscore-dangle
      members: selectedMembers.map((member) => member._id),
      workspace: cur,
    }

    fetch(`${localPort}/channels/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        token: String(localStorage.getItem('token')),
      },
      body: JSON.stringify(channelData),
    }).then((response) => {
      if (response.ok) {
        router.push(`/workspace/${router.query.classCode}`)
      } else {
        console.log('not response.ok')
      }
    })
  }

  const openSearchModal = () => {
    setSearchModalOpen(true)
  }

  const closeSearchModal = () => {
    setSearchModalOpen(false)
  }

  return (
    <SideBar>
      <Stack sx={{ paddingTop: 4 }} spacing={2}>
        <Box>
          <Typography sx={{ paddingBottom: 2 }} variant="h5">
            Channel name
          </Typography>
          <TextField
            fullWidth
            placeholder={placeholder.channelName}
            variant="standard"
            value={channelName}
            onChange={handleChannelNameChange}
          />
        </Box>
        <Box>
          <Typography sx={{ paddingBottom: 2 }} variant="h5">
            Description
          </Typography>
          <TextField
            fullWidth
            placeholder={placeholder.channelDescription}
            variant="standard"
            value={channelDescription}
            onChange={handleDescriptionChange}
          />
        </Box>
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={10}>
              <Typography variant="h5">
                Members ({selectedMembers.length})
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Button
                variant="outlined"
                onClick={openSearchModal}
                disableRipple
              >
                🔍 Search members
              </Button>
            </Grid>
          </Grid>
          <List dense sx={{ pl: 2 }}>
            {selectedMembers.map((value) => {
              const labelId = `member-${value.userId}`
              return (
                <ListItem key={value.userId} disablePadding>
                  <ListItem>
                    <ListItemText id={labelId} primary={`${value.userId}`} />
                  </ListItem>
                </ListItem>
              )
            })}
          </List>
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
              width: 300,
              height: 50,
            }}
            onClick={handleCreateChannel}
          >
            Create
          </Button>
        </Box>
      </Stack>
      {/* Search Modal */}
      {searchModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: '#fff',
              padding: 20,
              borderRadius: 4,
            }}
          >
            {/* Modal content goes here */}
            <TextField
              fullWidth
              placeholder="Search members"
              variant="standard"
              value={searchQuery}
              onChange={handleSearchQueryChange}
            />

            <List dense>
              {searchResults.map((value) => {
                const labelId = `member-${value.userId}`
                return (
                  <ListItem key={value.userId} disablePadding>
                    <ListItem button onClick={() => handleAddMember(value)}>
                      <ListItemText id={labelId} primary={`${value.userId}`} />
                    </ListItem>
                  </ListItem>
                )
              })}
            </List>

            <Button onClick={closeSearchModal}>Close</Button>
          </div>
        </div>
      )}
    </SideBar>
  )
}

export async function getServerSideProps() {
  const options = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  }

  const res = await fetch(`${localPort}/users/`, options)
  const users = await res.json()

  const workspacesOptions = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  }

  const workspacesRes = await fetch(
    `${localPort}/workspaces/`,
    workspacesOptions,
  )
  const workspaces = await workspacesRes.json()

  return {
    props: { users, workspaces },
  }
}
