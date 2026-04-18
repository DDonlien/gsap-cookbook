export type ControlType = "range" | "number" | "select" | "color" | "text";

export type ControlOption = { label: string; value: string };

export type Control = {
  key: string;
  label: string;
  type: ControlType;
  min?: number;
  max?: number;
  step?: number;
  options?: ControlOption[];
};

export type TagGroups = {
  playback: string[];
  type: string[];
  /** 对象/目标：例如 card / text / mouse 等，可多选（可缺省以兼容旧 demo） */
  target?: string[];
  related: string[];
};

export type DemoTags = {
  playback: string[];
  target: string[];
  type: string[];
  related: string[];
};

export type DemoMode = "preview" | "modal";

export type DemoMountOptions = {
  reduceMotion?: boolean;
  mode?: DemoMode;
  params?: Record<string, unknown>;
};

export type Demo = {
  id: string;
  title: string;
  subtitle: string;
  defaults?: Record<string, unknown>;
  controls?: Control[];
  /** 预览卡片/弹窗右上角的“动作按钮”（不侵入 demo 舞台） */
  action?: { icon: string; label: string };
  getCode?: (params: Record<string, unknown>) => string;
  mount: (el: HTMLElement, opts?: DemoMountOptions) => () => void;
  /** 兼容旧字段 */
  code?: string;
};
