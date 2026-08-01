import React from "react";

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(" ");

const AttachmentGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-2 w-full", className)} {...props} />
  )
)
AttachmentGroup.displayName = "AttachmentGroup"

const Attachment = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("group relative flex w-full items-center gap-3 rounded-xl border border-border bg-bg-main p-3 shadow-sm transition-colors hover:border-accent hover:bg-accent-soft", className)} {...props} />
  )
)
Attachment.displayName = "Attachment"

const AttachmentMedia = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bg-panel border border-border text-accent group-hover:bg-bg-main transition-colors overflow-hidden", className)} {...props} />
  )
)
AttachmentMedia.displayName = "AttachmentMedia"

const AttachmentContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col min-w-0 flex-1", className)} {...props} />
  )
)
AttachmentContent.displayName = "AttachmentContent"

const AttachmentTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm font-semibold text-text-main truncate", className)} {...props} />
  )
)
AttachmentTitle.displayName = "AttachmentTitle"

const AttachmentDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-xs text-text-muted", className)} {...props} />
  )
)
AttachmentDescription.displayName = "AttachmentDescription"

const AttachmentActions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex shrink-0 items-center gap-1", className)} {...props} />
  )
)
AttachmentActions.displayName = "AttachmentActions"

const AttachmentAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button ref={ref} className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-bg-panel hover:text-red-600 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/30 opacity-0 group-hover:opacity-100 cursor-pointer", className)} {...props} />
  )
)
AttachmentAction.displayName = "AttachmentAction"

export {
  AttachmentGroup,
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
}
