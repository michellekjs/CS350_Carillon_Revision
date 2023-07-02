import '../../app/globals.css'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import Accordion, { AccordionProps } from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LabeledInputBox from '@/components/LabeledInputBox'
import LinkButton from '@/components/LinkButton'
import { localPort } from '@/utils/constants'
import { IChannel, IUser } from '@/utils/types'
import validatePassword from '@/utils/validatePassword'
import SideBar from '../../components/SideBar'

const StyledButton = styled(Button)({
  textTransform: 'none',
  color: 'black',
  '& .MuiAccordionSummary-root': {
    padding: '40px',
  },
})

const StyledAccordion = styled((props: AccordionProps) => (
  <Accordion elevation={0} {...props} />
))(() => ({
  border: 0,
  padding: 0,
  margin: 0,
  '&::before': {
    backgroundColor: 'transparent',
  },
  '& > .MuiAccordionSummary-root': {
    minHeight: '0 !important',
  },
  '& > .Mui-expanded': {
    marginBottom: '8px',
  },
  '& > .MuiAccordionSummary-root > .MuiAccordionSummary-content': {
    margin: 0,
  },
}))

function ChannelList({
  userInfo,
  channels,
}: {
  userInfo: IUser
  channels: IChannel[]
}) {
  const findWorkspaceName = (id: string) => {
    return channels.find((c) => c.workspace._id === id)?.workspace.name || ''
  }
  const findChannelName = (id: string) => {
    return channels.find((c) => c._id === id)?.name || ''
  }
  const findWorkspace = (id: string) => {
    return channels.find((c) => c._id === id)?.workspace._id || ''
  }

  return (
    <StyledAccordion sx={{ width: '100%' }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
        sx={{ padding: 0, margin: 0 }}
      >
        <Typography>My Workspaces / Channels</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container rowSpacing={0.4}>
          {userInfo.participatingWorkspaces.map((item) => (
            <React.Fragment key={item}>
              <Grid item xs={12}>
                <StyledButton variant="text">
                  <Link
                    href={`/workspace/${findWorkspaceName(item)}`}
                    style={{ textDecoration: 'none', color: 'black' }}
                  >
                    <Typography>{findWorkspaceName(item)}</Typography>
                  </Link>
                </StyledButton>
              </Grid>
              {userInfo.participatingChannels
                .filter((c) => findWorkspace(c) === item)
                .map((channel) => (
                  <Grid item xs={12} paddingLeft={2} key={channel}>
                    <StyledButton variant="text">
                      <Link
                        href={`/workspace/${item}/channel/${channel}`}
                        style={{ textDecoration: 'none', color: 'black' }}
                      >
                        <Typography>{findChannelName(channel)}</Typography>
                      </Link>
                    </StyledButton>
                  </Grid>
                ))}
            </React.Fragment>
          ))}
        </Grid>
      </AccordionDetails>
    </StyledAccordion>
  )
}

export default function Mypage() {
  const [token, setToken] = useState('')
  const [id, setId] = useState('')
  const router = useRouter()
  const [form, setForm] = useState({ userId: '', password: '', userName: '' })
  const [userInfo, setUserInfo] = useState<IUser>()
  const [channels, setChannels] = useState<IChannel[]>([])
  const [saveCode, setSaveCode] = useState(0)
  const [valid, setValid] = useState(true)

  const submitForm = async () => {
    try {
      const res = await fetch(`${localPort}/users/${id}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          token,
        },
        body: JSON.stringify(form),
      })
      await res.json()
      setSaveCode(1)
    } catch (err) {
      setSaveCode(-1)
    }
  }

  useEffect(() => {
    const t = localStorage.getItem('token')
    const i = localStorage.getItem('_id')
    if (!t || !i) {
      router.push('/')
    } else {
      setToken(t)
      setId(i)
      const getData = async () => {
        try {
          const res = await fetch(`${localPort}/users/${i}`, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              token: t,
            },
          })
          const data = await res.json()
          setUserInfo(data)
          const channelss = await fetch(`${localPort}/channels/`, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              token: t,
            },
          })
          const channelData = await channelss.json()
          setChannels(channelData.filter((c: any) => c.workspace))
        } catch (err) {
          router.push('/')
        }
      }
      getData()
    }
  }, [router])

  useEffect(() => {
    if (userInfo) {
      setForm({
        userId: userInfo.userId,
        password: '',
        userName: userInfo.userName,
      })
    }
  }, [userInfo])

  useEffect(() => {
    setSaveCode(0)
    setValid(validatePassword(form.password))
  }, [form])

  if (!userInfo) {
    return <div></div>
  }

  return (
    <SideBar>
      <Stack
        spacing={3}
        justifyContent="center"
        alignItems="center"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          paddingX: '160px',
        }}
      >
        <LabeledInputBox
          label="ID"
          value={form.userId}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, userId: e.target.value }))
          }
        />
        <Stack style={{ width: '100%' }}>
          <LabeledInputBox
            label="New Password"
            type="password"
            value=""
            onChange={(e) => {
              setForm((prev) => ({ ...prev, password: e.target.value }))
            }}
          />
          <Typography
            variant="caption"
            color="#CE0101"
            display={valid || form.password === '' ? 'none' : ''}
          >
            At least 10 characters including English letters and numbers or
            special characters. At least 8 characters including all three. Only
            !, @, #, $, %, ^, &, and * are allowed for the special characters.
          </Typography>
        </Stack>
        <LabeledInputBox
          label="Name"
          value={form.userName}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, userName: e.target.value }))
          }
        />
        <ChannelList userInfo={userInfo} channels={channels} />
        <Stack justifyContent="center" alignItems="center">
          <Typography
            variant="caption"
            color={saveCode < 0 ? '#CE0101' : '#2f6eba'}
            style={{ visibility: saveCode !== 0 ? 'visible' : 'hidden' }}
          >
            {saveCode < 0
              ? 'Failed to save. Try agin.'
              : 'Saved your information successfully.'}
          </Typography>
          <LinkButton
            onClick={submitForm}
            disabled={form.userId === '' || form.userName === '' || !valid}
          >
            Save
          </LinkButton>
        </Stack>
      </Stack>
    </SideBar>
  )
}
