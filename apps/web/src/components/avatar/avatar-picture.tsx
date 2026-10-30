import type * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/avatar.tsx"

const portrait =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" fill="#d4d4d8"/><circle cx="24" cy="19" r="8" fill="#71717a"/><path d="M8 46c2-9 8-14 16-14s14 5 16 14z" fill="#71717a"/></svg>'
  )

export function AvatarPicture(): React.ReactElement {
  return (
    <ul className="flex flex-wrap items-center gap-6 text-sm">
      <li className="flex items-center gap-related">
        <Avatar size="lg">
          <AvatarImage src={portrait} alt="" />
          <AvatarFallback>MO</AvatarFallback>
        </Avatar>
        Mira Okafor
      </li>
      <li className="flex items-center gap-related">
        <Avatar size="lg">
          <AvatarFallback>JL</AvatarFallback>
        </Avatar>
        Jonas Lindqvist
      </li>
      <li className="flex items-center gap-related">
        <Avatar size="lg" shape="square">
          <AvatarFallback>ST</AvatarFallback>
        </Avatar>
        Security team
      </li>
    </ul>
  )
}
