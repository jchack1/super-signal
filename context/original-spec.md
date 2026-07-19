# Discord replacement / Super signal

## First Class "objects"

- **Folders** (with user permissions)
  - Everything else would be able to be "located" within a folder, within a filesystem.
  - Directory or Destination
- **File System** (root folder)
  - Directory or Destination
- **Users** with a number of Avatars
  - **Avatars**: representation of a user and their place within the file system.
- **Agents** (machine controlled Users aka Bots)
  - **Bots** (a specific agent performing a specific role?)
  - **LLM** (the "name" of the type/origin of the agent. Eg. GPT4o, Claude, etc.)
- **Chat Channel** (just like Discord)
- **Voice Channel** (just like Discord)
- **File Types** (just like Google Docs)
  - Word Processor
  - Spread Sheet
  - Slide Show
  - Pixel Image
  - PDF (editable)
  - PDF (fixed)
  - Vector Image
  - Database
  - Audio
  - Video
  - Animation
  - 3D model
  - Code/Script
  - Web page (could just be a secondary way of viewing a folder with code / images in it)
  - Stream / Screen share
- **Server** (self hosted or Virtual Instance)
  - Needs to have a Host
- **Host** (physical hardware or cloud env)
  - Must be running a Server or it's not a Host
  - Has one or more Filesystems
  - Has a command line interface
  - Has "commands" that also have "user permissions"

## Command line

- `cd` — Change Directory or "Destination"
  - Each file or object could also be a Destination (you could be inside an editable document with another user, like Google Docs, or inside a video with other users to see what part of the video they are watching to "watch together" or see their cursor inside a slide show, etc)
- `mv` — Move
- `cp` — Copy
- `ls` — list sub directories/destinations
- `@<username>` — to send/leave a message to specific users/avatars/agents
  - `@here` and `@everyone` only apply to other users within the current folder
  - `@HERE` and `@EVERYONE` apply to nested folders as well, cuz ALL CAPS IS YELLING lmao
- `#<hashtag or channel name>` — sends/leaves the messages to anyone listening to or searching for that tag
- `find` — runs a search

## Other objects

- **Shorts Stream** (an infinite scroll of short videos (+images+text+comments) fed by an "Algorithm".)
- **Comment Section** (a text stream that may be appended to with attribution but NOT edited)
  - Is this the same as a Chat Channel?
- **Algorithm** (a specific role. Could be performed by a Bot or User)
- **App** (installable mobile application)
- **Program** (installable desktop application)

## External References

- **Verification** (cryptographic signature OF a given user)
- **Certification** (cryptographic signature FROM a given user/organization)
- **Organization** (legal entity, Corp, Gov, Charity etc.)
- **Journalist/Reporter** (verified users who can be followed publicly)
- **Influencer** (non-verified user who can be followed publicly)
- **Credits/Money** (literal digital currency? Bit coins? Or some other way to publicly move a representation of actual fungible currency?)
- **Tokens** (units of "work" that may or may not be consumed by Agents?)
- **Moderator** (user with advanced permissions?)
- **Administrator** (user with all advanced permissions)
- **Owner** (owner of the file, server, etc.)

## Contexts

These would change the default view and add more file-types.

- **Dev**
  - This mode would assume you want to see the code before you run anything.
- **Gaming**
  - This mode would assume you want to run things without seeing any code. It would also enable every folder to be viewed as a 2d or 3d level with your avatar moving through it.
- **Creative**
  - Like gaming mode but with more control over everything. Like Minecraft Creative mode.
- **Web**
  - Assume everything should be rendered like a web page. Potentially automatically generating headers and footers?
