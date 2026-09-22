/**
 * 通用 Dropdown（基于 @radix-ui/react-popover 封装）
 *
 * 为什么用 Popover 而不是 DropdownMenu：本项目场景（草稿箱面板、
 * 类型选择面板等"富内容弹层"）不是纯菜单项列表，Popover 更贴切；
 * 且定位能力一致 —— Radix 自带碰撞检测（avoidCollisions）：
 * 溢出视口自动翻转方向、钳制边界，无需手写 getBoundingClientRect。
 *
 * 用法：
 *   <Dropdown open={open} onOpenChange={setOpen}>
 *     <DropdownTrigger asChild><Button>…</Button></DropdownTrigger>
 *     <DropdownContent className="w-80">…面板内容…</DropdownContent>
 *   </Dropdown>
 *
 * 外点关闭 / Esc 关闭由 Radix 处理；点击内容区内部不会关闭。
 */
import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "../../lib/utils";

const Dropdown = PopoverPrimitive.Root;

const DropdownTrigger = React.forwardRef(function DropdownTrigger(
  { className, ...props },
  ref,
) {
  return <PopoverPrimitive.Trigger ref={ref} className={cn(className)} {...props} />;
});

const DropdownContent = React.forwardRef(function DropdownContent(
  { className, align = "end", sideOffset = 8, collisionPadding = 8, ...props },
  ref,
) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          "z-50 rounded-lg border border-slate-200 bg-white shadow-xl focus:outline-none",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});

/** 面板内需要点击后收起的位置用（如菜单项） */
const DropdownClose = PopoverPrimitive.Close;

export { Dropdown, DropdownTrigger, DropdownContent, DropdownClose };
