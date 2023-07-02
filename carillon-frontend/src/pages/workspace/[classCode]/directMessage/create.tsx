import React, { useState, ChangeEvent } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { localPort } from '@/utils/constants'
import { IUser } from '@/utils/types'
import { useRouter } from 'next/router'
import SideBar from '@/components/SideBar'
import TextField from '@mui/material/TextField'

interface UsersProps {
  users: IUser[]
}

export default function Channel({ users }: UsersProps) {
  const router = useRouter()
  const [searchResults, setSearchResults] = useState<IUser[]>([])
  const [selectedMembers, setSelectedMembers] = useState<IUser[]>([])
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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

  const handleCreateWorkspace = () => {
    // To Do: workspace 정보 바꾸기
    const currentUser = ''

    const directMessageData = {
      name: 'directMessage',
      owner: currentUser,
      members: selectedMembers.map((member) => member.userId),
      muteMembers: [],
    }

    // To Do: dmCreate 정보 저장 어떻게??
    // fetch(`${localPort}/workspaces/`, {
    //   method: 'POST',
    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json',
    //     token:
    //       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NzM3MTYwZjJjNzNkMDgzMTgxNGM2ZiIsInR5cGUiOiJTVFVERU5UIiwiaWF0IjoxNjg1Mjk2NDY1LCJleHAiOjE2ODUzODI4NjV9.-5OLJTlGNBc63n8UNoJdOp60gBYOPqQLI90mAI3ZEr0',
    //   },
    //   body: JSON.stringify(directMessageData),
    // }).then((response) => {
    //   if (response.ok) {
    //     router.push(
    //       `/workspace/${router.query.classCode}/directMessage/${1111}`,
    //     )
    //   } else {
    //     console.log('not response.ok')
    //   }
    // })
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
            onClick={handleCreateWorkspace}
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

  return {
    props: { users },
  }
}
