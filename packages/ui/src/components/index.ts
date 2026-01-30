// Utilities
export { cn } from "../lib/utils";

// Buttons & Actions
export { Button, buttonVariants, type ButtonProps } from "./button";

// Cards & Containers
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  type CardContentProps,
  type CardDescriptionProps,
  type CardFooterProps,
  type CardHeaderProps,
  type CardProps,
  type CardTitleProps,
} from "./card";

// Form Elements
export { Input, type InputProps } from "./input";
export { Checkbox, type CheckboxProps } from "./checkbox";

// Layout - Sidebar
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarSeparator,
  type SidebarContentProps,
  type SidebarFooterProps,
  type SidebarGroupProps,
  type SidebarHeaderProps,
  type SidebarItemProps,
  type SidebarProps,
  type SidebarSeparatorProps,
} from "./sidebar";

// Layout - SlideOver
export {
  SlideOver,
  SlideOverContent,
  SlideOverFooter,
  SlideOverHeader,
  type SlideOverContentProps,
  type SlideOverFooterProps,
  type SlideOverHeaderProps,
  type SlideOverProps,
} from "./slide-over";

// Data Display
export { Avatar, AvatarGroup, avatarVariants, type AvatarProps, type AvatarGroupProps } from "./avatar";
export { Badge, badgeVariants, type BadgeProps } from "./badge";
export { Separator, type SeparatorProps } from "./separator";

// Chat
export {
  ChatMessage,
  ChatTypingIndicator,
  chatMessageVariants,
  type ChatMessageProps,
} from "./chat-message";
export { ChatInput, type ChatInputProps } from "./chat-input";

// Theme
export { ThemeToggle, type ThemeToggleProps, type Theme } from "./theme-toggle";

// Loading & Feedback
export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  type SkeletonProps,
  type SkeletonTextProps,
  type SkeletonCardProps,
} from "./skeleton";
export {
  EmptyState,
  type EmptyStateProps,
  type EmptyStateAction,
} from "./empty-state";
