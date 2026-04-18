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
  tags: TagGroups;
  defaults?: Record<string, unknown>;
  controls?: Control[];
  getCode?: (params: Record<string, unknown>) => string;
  mount: (el: HTMLElement, opts?: DemoMountOptions) => () => void;
  /** 兼容旧字段 */
  code?: string;
};

