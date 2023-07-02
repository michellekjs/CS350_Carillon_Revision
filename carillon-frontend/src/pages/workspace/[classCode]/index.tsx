/* eslint-disable no-underscore-dangle */
import React, { useState, ChangeEvent } from 'react'
import '@/app/globals.css'
import CloudQueueIcon from '@mui/icons-material/CloudQueue'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import { IUser, IWorkspace, IChannel } from '@/utils/types'
import { localPort } from '@/utils/constants'
import { useRouter } from 'next/router'
import SideBar from '@/components/SideBar'
import TextField from '@mui/material/TextField'

interface WorkspacesProps {
  users: IUser[]
  workspaces: IWorkspace[]
  channels: IChannel[]
}

export default function ClassMainPage({
  users,
  workspaces,
  channels,
}: WorkspacesProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMemberModalOpen, setSearchMemberModalOpen] = useState(false)
  const [searchWorkspaceModalOpen, setSearchWorkspaceModalOpen] =
    useState(false)
  const [searchMemberResults, setMemberSearchResults] = useState<IUser[]>([])
  const [selectedMembers, setSelectedMembers] = useState<IUser[]>([])
  const [searchWorkspaceResults, setWorkspaceSearchResults] = useState<
    IWorkspace[]
  >([])

  let cur = workspaces[0]
  for (let i = 0; i < workspaces.length; i += 1) {
    if (workspaces[i].name === router.query.classCode) {
      cur = workspaces[i]
    }
  }
  const [currentWorkspace, setCurrentWorkspace] = useState<IWorkspace>(cur)

  const currentChannels = []

  for (let i = 0; i < channels.length; i += 1) {
    if (channels[i].workspace?._id === currentWorkspace?._id) {
      currentChannels.push(channels[i])
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

    const matchedWorkspace = workspaces.find(
      (workspace) => workspace.name.toLowerCase() === query.toLowerCase(),
    )

    const matchedWorkspaces = workspaces.filter((workspace) =>
      workspace.name.toLowerCase().includes(query.toLowerCase()),
    )

    setMemberSearchResults(matchedUsers.slice(0, 5))
    setWorkspaceSearchResults(matchedWorkspaces.slice(0, 5))

    if (matchedUser && !selectedMembers.includes(matchedUser)) {
      setSelectedMembers((prev) => [...prev, matchedUser])
    }

    if (matchedWorkspace && !matchedWorkspaces.includes(matchedWorkspace)) {
      setWorkspaceSearchResults((prev) => [...prev, matchedWorkspace])
    }
  }

  const handleAddMember = (member: IUser) => {
    if (!selectedMembers.includes(member)) {
      setSelectedMembers((prev) => [...prev, member])
    }
  }

  const handleChangeWorkspace = (workspace: IWorkspace) => {
    setCurrentWorkspace(workspace)
    router.push(`/workspace/${workspace.name}`)
  }

  const handleAddChannel = () => {
    router.push(`/workspace/${currentWorkspace.name}/channel/create`)
  }

  const openMemberSearchModal = () => {
    setSearchMemberModalOpen(true)
  }

  const closeMemberSearchModal = () => {
    setSearchMemberModalOpen(false)
  }

  const openWorkspaceSearchModal = () => {
    setSearchWorkspaceModalOpen(true)
  }

  const closeWorkspaceSearchModal = () => {
    setSearchWorkspaceModalOpen(false)
  }

  const handleDeleteWorkspace = () => {
    const workspaceData = {
      name: currentWorkspace.name,
    }

    fetch(`${localPort}/workspaces/`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        token: String(localStorage.getItem('token')),
      },
      body: JSON.stringify(workspaceData),
    }).then((response) => {
      if (response.ok) {
        router.push('/workspace')
      } else {
        console.log('not response.ok')
      }
    })
  }

  return (
    <SideBar>
      <Stack sx={{ paddingTop: 4 }} spacing={2}>
        <Button
          variant="outlined"
          onClick={openWorkspaceSearchModal}
          disableRipple
          sx={{ width: 300 }}
        >
          🔍 Search workspace
        </Button>
        <Typography
          variant="h3"
          component="h3"
          sx={{
            display: 'flex',
            paddingBottom: 2,
            borderBottom: 1,
            borderColor: 'lightgray',
          }}
        >
          <CloudQueueIcon sx={{ fontSize: 50, mr: 1 }} />
          {currentWorkspace.name}
        </Typography>
        <Box
          sx={{
            paddingBottom: 2,
            borderBottom: 1,
            borderColor: 'lightgray',
          }}
        >
          <Typography sx={{ paddingBottom: 2 }} variant="h5">
            Description
          </Typography>
          {/* To Do: workspace에 description 추가 필요 */}
          <Typography variant="body1">
            {currentWorkspace.description}
          </Typography>
        </Box>
        <Box
          sx={{
            paddingBottom: 2,
            borderBottom: 1,
            borderColor: 'lightgray',
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h5">Channels</Typography>
            </Grid>
            {/* <Grid item xs={4}>
              <SearchBar onChange={handleSearchQueryChange} />
            </Grid> */}
            <List
              dense
              sx={{
                pl: 4,
              }}
            >
              {currentChannels.length > 0 &&
                currentChannels.map((value) => {
                  return (
                    <ListItem key={value._id} disablePadding>
                      <FolderOpenIcon sx={{ mr: 2 }} />
                      <ListItemText id={value._id} primary={`${value.name}`} />
                    </ListItem>
                  )
                })}
            </List>
            <Grid item xs={12}>
              {/* To Do: New Channel 추가 */}
              <Button sx={{ mt: 12 }} variant="text" onClick={handleAddChannel}>
                + New Channel
              </Button>
            </Grid>
          </Grid>
        </Box>
        <Box
          sx={{
            paddingBottom: 2,
            borderBottom: 1,
            borderColor: 'lightgray',
          }}
        >
          <Typography variant="h5">Members</Typography>
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
          {/* To Do: New Member 추가 */}
          <Button sx={{ mt: 1 }} variant="text" onClick={openMemberSearchModal}>
            + New Member
          </Button>
        </Box>
        <Box
          sx={{
            display: 'flex',
          }}
        >
          <Box></Box>
          <Button
            sx={{ marginLeft: 'auto' }}
            variant="text"
            onClick={handleDeleteWorkspace}
          >
            Delete Workspace
          </Button>
        </Box>
      </Stack>
      {/* Search Modal */}
      {searchMemberModalOpen && (
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
              {searchMemberResults.map((value) => {
                const labelId = `member-${value.userId}`
                return (
                  <ListItem
                    key={value.userId}
                    disablePadding
                    button
                    onClick={() => handleAddMember(value)}
                  >
                    <ListItemText id={labelId} primary={`${value.userId}`} />
                  </ListItem>
                )
              })}
            </List>

            <Button onClick={closeMemberSearchModal}>Close</Button>
          </div>
        </div>
      )}

      {searchWorkspaceModalOpen && (
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
              placeholder="Search workspaces"
              variant="standard"
              value={searchQuery}
              onChange={handleSearchQueryChange}
            />

            <List dense>
              {searchWorkspaceResults.map((value) => {
                return (
                  <ListItem key={value._id} disablePadding>
                    <ListItem
                      button
                      onClick={() => handleChangeWorkspace(value)}
                    >
                      <ListItemText id={value._id} primary={`${value.name}`} />
                    </ListItem>
                  </ListItem>
                )
              })}
            </List>

            <Button onClick={closeWorkspaceSearchModal}>Close</Button>
          </div>
        </div>
      )}
    </SideBar>
  )
}

export async function getServerSideProps() {
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

  const usersOptions = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  }

  const usersRes = await fetch(`${localPort}/users/`, usersOptions)
  const users = await usersRes.json()

  const channelOptions = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  }

  const channelRes = await fetch(`${localPort}/channels/`, channelOptions)
  const channels = await channelRes.json()

  return {
    props: { users, workspaces, channels },
  }
}
