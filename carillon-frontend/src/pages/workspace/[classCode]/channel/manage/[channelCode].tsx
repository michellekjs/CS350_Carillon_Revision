import React, { useState, ChangeEvent } from 'react'
import { useRouter } from 'next/router'
import '../../../../../app/globals.css'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Checkbox from '@mui/material/Checkbox'
import { IUser, IWorkspace, IChannel } from '@/utils/types'
import { localPort } from '@/utils/constants'
import TextField from '@mui/material/TextField'
import SideBar from '../../../../../components/SideBar'

interface ChannelProps {
  users: IUser[]
  workspaces: IWorkspace[]
  channels: IChannel[]
}

export default function ChannelComp({
  users,
  workspaces,
  channels,
}: ChannelProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMemberModalOpen, setSearchMemberModalOpen] = useState(false)
  const [searchMemberResults, setMemberSearchResults] = useState<IUser[]>([])

  // To Do: members 값 초기값 넣어주기
  const curChannel = channels.filter((e) => {
    // eslint-disable-next-line no-underscore-dangle
    return e._id === router.query.channelCode
  })[0]

  const [selectedMembers, setSelectedMembers] = useState(curChannel.members)

  const handleSearchQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value
    setSearchQuery(query)

    const matchedUser = users.find(
      (user) => user.userId.toLowerCase() === query.toLowerCase(),
    )

    const matchedUsers = users.filter((user) =>
      user.userId.toLowerCase().includes(query.toLowerCase()),
    )

    setMemberSearchResults(matchedUsers.slice(0, 5))

    if (matchedUser && !selectedMembers.includes(matchedUser)) {
      setSelectedMembers((prev) => [...prev, matchedUser])
    }
  }

  const handleAddMember = (member: IUser) => {
    if (!selectedMembers.includes(member)) {
      setSelectedMembers((prev) => [...prev, member])
    }
  }

  const handleKickMember = (member: IUser) => {
    // To Do: delete member 구현
    fetch(`${localPort}/channels/${router.query.channelCode}/members/kick`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        token: JSON.stringify(localStorage.getItem('token')),
      },
      // To Do: worskapce 바꾸기
      body: JSON.stringify({ members: [member] }),
    }).then((response) => {
      if (response.ok) {
        console.log('response.ok')
        // router.push(`/workspace/${router.query.classCode}`)
      } else {
        console.log('not response.ok')
      }
    })
  }

  const openMemberSearchModal = () => {
    setSearchMemberModalOpen(true)
  }

  const closeMemberSearchModal = () => {
    setSearchMemberModalOpen(false)
  }

  const handleDeleteChannel = () => {
    fetch(`${localPort}/channels/`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        token: JSON.stringify(localStorage.getItem('token')),
      },
      // To Do: worskapce 바꾸기
      body: JSON.stringify({ name: channels[0].name, workspace: 'workspace' }),
    }).then((response) => {
      if (response.ok) {
        router.push(`/workspace/${router.query.classCode}`)
      } else {
        console.log('not response.ok')
      }
    })
  }

  return (
    <SideBar>
      <Stack sx={{ paddingTop: 4 }} spacing={2}>
        <Typography variant="h3">Channel {router.query.channelCode}</Typography>
        <Grid
          container
          justifyContent="space-between"
          sx={{
            paddingBottom: 2,
            borderBottom: 1,
            borderColor: 'lightgray',
          }}
        >
          <Grid item xs={10}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {curChannel.name === 'Default Channel' ? (
                <Checkbox defaultChecked />
              ) : (
                <Checkbox disabled />
              )}
              <Typography variant="body2">Default Channel</Typography>
            </Box>
          </Grid>
          <Grid item xs={2}>
            <Button variant="text" onClick={handleDeleteChannel}>
              Delete Channel
            </Button>
          </Grid>
        </Grid>
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
          <Typography variant="body1">{curChannel.description}</Typography>
        </Box>
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={8.8}>
              <Typography variant="h5">Members</Typography>
            </Grid>
            <Grid item xs={3.2}>
              <Button
                variant="outlined"
                onClick={openMemberSearchModal}
                disableRipple
                sx={{ width: 300 }}
              >
                Add member
              </Button>
            </Grid>
          </Grid>
          <List
            dense
            sx={{
              pl: 2,
            }}
          >
            <List dense sx={{ pl: 2 }}>
              {selectedMembers &&
                selectedMembers.map((value) => {
                  const label = `member-${value}`
                  return (
                    <ListItem key={label} disablePadding>
                      <ListItemText id={label} primary={`${value}`} />
                      <Button onClick={() => handleKickMember(value)}>
                        Delete
                      </Button>
                    </ListItem>
                  )
                })}
            </List>
          </List>
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
