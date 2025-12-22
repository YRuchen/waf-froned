```text
FilterBar/
├── FilterBar.vue                        # 统一入口，根据 mode 选择布局
├── FilterItem.vue                       # label + 控件布局（基础组件）
├── index.ts                             # 出口
├── types.ts                             # schema 类型定义
├── README.md
├── controls/                            # 具体控件实现
│   ├── InputControl.vue
│   └── SelectControl.vue
└── layouts/                             # 【新增】布局组件层
    ├── CollapsibleLayout.vue            # 可折叠布局（展开/收起）
    ├── CompactLayout.vue                # 紧凑布局（隐藏 label）
    └── SeparatedLayout.vue              # 分离布局（按钮单独一行）
```
