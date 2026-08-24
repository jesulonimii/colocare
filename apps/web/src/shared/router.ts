// Generouted, changes to this file will be overridden
/* eslint-disable */

import { components, hooks, utils } from '@generouted/react-router/client'

export type Path =
  | `/`
  | `/calendar`
  | `/dashboard`
  | `/goals`
  | `/login`
  | `/onboarding`
  | `/patients`
  | `/patients/:id`
  | `/profile`
  | `/recommendations`
  | `/resources`

export type Params = {
  '/patients/:id': { id: string }
}

export type ModalPath = never

export const { Link, Navigate } = components<Path, Params>()
export const { useModals, useNavigate, useParams } = hooks<Path, Params, ModalPath>()
export const { redirect } = utils<Path, Params>()
