---
title: "List / Dictionary / Queue / Stack，"
published: 2026-11-20
category: "从零开始的c#学习之路"
---
# 第 8 周复盘：List / Dictionary / Queue / Stack，做出一个能存档的待办清单

---

## 开篇：这一周真正做了什么

上一周（第 7 周）我写了个日志系统，会往屏幕和文件里写东西。但那都是**别人给我的数据**——程序一关，什么也不剩。

这一周不一样。目标写在计划面板上就一句话：

> **待办清单（增删改查 + 存文件）**

看着像四个功能，真写下来 154 行。而且我犯了一个错，犯了**五次**。

先说结论：**这一周我最大的收获不是学会了四个集合，是想明白了一件事——「跨轮要用的东西，必须声明在循环外面」。**

---

## 一、我卡在哪

### 卡点 1：数组装不下「不知道有几个」的东西

一开始我想用数组存待办。问题是我根本不知道用户会加几条。

- 开 `new string[3]`，加到第 4 条就崩
- 开 `new string[100]`，那第 101 条呢
- 删掉中间一条，后面的不会自动往前补，留个空洞
- 想扩容得自己 `new` 一个更大的数组，再 `Array.Copy` 搬过去

### 卡点 2：计数器永远打印成 1

菜单里「查看全部」，我要打印 1 买菜、2 写代码、3 睡觉。

结果三条全打印成 1。

### 卡点 3：break 用错，程序退不出去 / 提前中断

- 选「5.退出」时我写 `case 5: break;`，结果菜单又回来了，永远退不出
- 后来在「按顺序做任务」的循环里，用户输错了，我写 `break` 想「跳过这个」，结果**后面所有任务全被跳过了**

### 卡点 4：存档写进去了，但读不回来

`File.WriteAllLines("todo.txt", lines)` 存好了，启动时 `File.Exists("todos.txt")` 判断——**读的是另一个文件**。

### 卡点 5：撤销功能无从下手

删掉的任务已经不在列表里了，撤销时怎么「加回来」？加回来要什么参数？

---

## 二、根因

### 根因 1：数组的长度是「编译期写死」的，装不下运行期的未知

`List<T>` 就是来解决这件事的。它内部还是数组，但**长度不够时自动换更大的、自动搬家**——这部分由它自己做，我不用管。

实测它的 `Capacity` 会翻倍增长：

```
刚创建:        Count=0, Capacity=0
加了 1 个:     Count=1, Capacity=4
加了 4 个:     Count=4, Capacity=4
加了 5 个:     Count=5, Capacity=8
```

**`Count` 是「里面实际有几个」，`Capacity` 是「柜子修了多大」。** 平时只关心 `Count`。

数组叫 `Length`（修好的长度），List 叫 `Count`（数出来的个数）——命名不同正是因为含义不同。

### 根因 2：变量声明在循环体里 = 每轮都被重置

```csharp
foreach (var t in todos)
{
    int i = 1;                        // 每轮新建，每次都是 1
    Console.WriteLine(i);
    i++;                              // 加完就扔了
}
```

**循环体每执行一次，里面的局部变量就重新诞生一次。** 上一轮那个 `i` 已经死了。

这个错的变体我已经踩过五次：

| 第几次 | 场景 | 变量 |
|---|---|---|
| 1 | 第 3 周排序 | `int max` |
| 2 | 第 6 周找最长叫声 | `string longest` |
| 3 | 第 8 周打印编号 | `int i` |
| 4 | 第 8 周撤销历史 | `var history = new Stack` |

口诀：**「跨轮要用的东西，都在圈外面」。**

### 根因 3：break 只跳出「最近的一层」

```csharp
while (true)              // 你想跳出这层
{
    switch (n)
    {
        case 5:
            break;        // 但它只跳出 switch，while 还在转
    }
}
```

```csharp
while (q.Count > 0)       // 你不想跳出这层
{
    if (输入为空)
        break;            // 但它跳出了 while，后面所有任务没了
}
```

**判断表：**

| 想干什么 | 用什么 |
|---|---|
| 跳过这一轮，进入下一轮 | `continue` |
| 整个循环不要了 | `break` |
| 只跳出 `switch` | `break`（switch 自带一层） |
| 直接结束方法/程序 | `return` |

### 根因 4：文件名是「契约」，写和读必须是同一个字符串

写进 `todo.txt`，又从 `todos.txt` 读——**永远读不到，且不报任何错**。

这种 bug 最阴险：不崩、不警告、就是没效果。

解法是**定义一个常量**，从源头消灭笔误：

```csharp
const string SavePath = "todos.txt";
```

### 根因 5：撤销的本质是「记录 + 反向操作」

删除是**不可逆**的——删掉的任务不在列表里了，谁也找不回来。

所以撤销**必须在动手之前先记账**：

```csharp
history.Push("del|" + todos[idx - 1].Content + "|" + todos[idx - 1].Level);  // 先记
todos.RemoveAt(idx - 1);                                                    // 再删
```

**注意记了三段：类型、内容、优先级。** 只记内容的话，撤销回来后优先级会丢——因为 `Todo` 的 `Level` 是构造函数赋值的只读属性，事后改不了。

---

## 三、定位过程

### 定位「编号全是 1」

不是看代码看出来的，是**跑出来的**——用脚本喂输入，看实际输出：

```
1.[ ] 买菜(Low)
1.[ ] 写代码(High)
1.[ ] 买牛奶(Normal)     ← 都是 1
```

把实际输出和代码对齐，一眼看出 `int i = 1;` 的位置不对。

**教训：不要「读」代码找 bug，要「跑」代码看输出。**

### 定位「文件锁」

```
warning MSB3026: 无法将 apphost.exe 复制到 bin\Debug\net10.0\week8.exe
The process cannot access the file ... 文件被"week8 (2452)"锁定
```

判据：**`error` 数量为 0，但出现「文件被 xxx (数字) 锁定」** → 上一个运行窗口没关，不是代码问题。

```powershell
Get-Process week8 | Stop-Process -Force
```

### 定位「变量重名」

```
error CS0136: 无法在此范围中声明名为"i"的局部变量
```

原因：把 `int i = 1;` 挪出去时，**里面那个忘删了**，同一作用域两个 `i`。

### 定位「read 和 write 文件不一致」

把两处文件名并排看：

```csharp
if (File.Exists("todos.txt"))              // 读 todos.txt
File.WriteAllLines("todo.txt", lines);     // 写 todo.txt
```

**搜同一个字符串的所有出现位置**，比读代码可靠。

---

## 四、正确做法

### 1. 用 for 而不是 foreach（当你要序号时）

```csharp
for (int i = 0; i < todos.Count; i++)
    Console.WriteLine(`${i + 1}.[{done}] {todos[i].Content}`);
```

- `i` 从 0 起（下标）
- 显示写 `{i + 1}`（用户从 1 数）
- **内部 0 起、显示 +1** —— 正好是「用户输入 2 要传 `RemoveAt(1)`」的镜像

**分工判断：**

| 你要什么 | 用 |
|---|---|
| 只要元素 | `foreach` |
| 要元素 + 序号 / 要下标 | `for` |

### 2. 存文件：对象 → 字符串 → 文件

```csharp
List<string> lines = new();
foreach (var t in todos)
    lines.Add(t.Content + "|" + t.Level + "|" + t.IsDone);
File.WriteAllLines("todos.txt", lines);
```

文件内容：

```
买菜|Low|False
写代码|High|True
```

### 3. 读文件：文件 → 字符串 → 对象

```csharp
if (File.Exists("todos.txt"))
{
    foreach (var line in File.ReadAllLines("todos.txt"))
    {
        string[] parts = line.Split('|');
        var level = Enum.Parse<Priority>(parts[1]);      // "Low" -> Priority.Low
        var todo = new Todo(parts[0], level);            // 前两个字段进构造函数
        todo.IsDone = bool.Parse(parts[2]);              // 第三个字段单独赋值
        todos.Add(todo);
    }
}
```

**关键点：**

- `parts[1]` 是 **string**，不是 `Priority` —— 必须 `Parse`
- `Enum.Parse<Priority>` 泛型版直接返回 `Priority`；非泛型版返回 `object`，还得强转
- 写错值会抛 `ArgumentException`，稳妥用 `Enum.TryParse`
- **`Content` 和 `Level` 是 `{ get; }` 只读，只能进构造函数；`IsDone` 是 `{ get; set; }`，可以事后改**

### 4. Queue 处理「按顺序做完」

```csharp
var q = new Queue<Todo>();
foreach (var t in todos)
    if (!t.IsDone)
        q.Enqueue(t);

while (q.Count > 0)
{
    var task = q.Dequeue();
    Console.WriteLine("待做：" + task.Content);
    // 问 y/n，y 就 task.IsDone = true
}
```

- `List` 是「查看」，`Queue` 是「消耗」（取一个少一个）
- 空队列 `Dequeue` 抛 `InvalidOperationException`，稳妥用 `TryDequeue`

### 5. Stack 做撤销

```csharp
Stack<string> history = new();     // 一定要在 while 外面

// 三处记账
history.Push("add|" + input);
history.Push("done|" + todos[n1 - 1].Content);
history.Push("del|" + todos[idx - 1].Content + "|" + todos[idx - 1].Level);

// 撤销
if (history.Count == 0) { Console.WriteLine("没有可撤销的操作"); break; }
string last = history.Pop();
string[] p = last.Split('|');
if (p[0] == "del")       todos.Add(new Todo(p[1], Enum.Parse<Priority>(p[2])));
else if (p[0] == "add")  todos.RemoveAll(t => t.Content == p[1]);
else if (p[0] == "done") foreach (var t in todos) if (t.Content == p[1]) t.IsDone = false;
```

**为什么用 Stack 不用 Queue？** 撤销要撤「最近一次」，不是「最早一次」——后进先出才对。

### 6. Dictionary 做分组

```csharp
var groups = new Dictionary<Priority, List<Todo>>();

foreach (var t in todos)
{
    if (!groups.ContainsKey(t.Level))
        groups[t.Level] = new List<Todo>();      // 第一次见，先建空列表
    groups[t.Level].Add(t);                      // 再塞进去
}
```

输出：

```
[Low] 1 条
    买菜
[High] 2 条
    写代码
    修bug
[Normal] 1 条
    睡觉
```

**`groups[t.Level]` 拿到的是一个列表容器，然后 `.Add(t)` 往里塞。**

**两个坑：**

1. 漏掉 `ContainsKey` 判断 → `KeyNotFoundException`（读不存在的键会抛，**写不会**）
2. **`Dictionary` 的遍历顺序不保证** —— 实测换插入顺序，输出顺序跟着变。要固定顺序就自己按 `Priority` 循环

---

## 五、验收判据

### 功能验收（全过）

| 检查 | 方法 | 结果 |
|---|---|---|
| 编译 | `dotnet build` | 0 error 0 warning |
| 增 | 选 1 加两条 | 列表出现两条，编号从 1 起 |
| 查 | 选 2 | 格式 `1.[ ] 买菜(Normal)` 正确 |
| 改 | 选 3 标第 2 条 | 变成 `2.[✓]`，且优先级没变 |
| 删 | 选 4 输 1 | 删掉的是第 1 条（不是第 2 条） |
| 防崩 | 输 `abc` | 提示「请输入数字」并回到菜单 |
| 退出 | 选 5 | 进程退出（不是回到菜单） |
| 保存 | 选 6 | `todos.txt` 出现，格式「内容\|优先级\|完成」 |
| **存档** | 标完成 → 保存 → **杀掉进程重开** → 选 2 | **`[✓]` 还在** |
| Queue | 选 7 | 只弹出**未完成**的，按顺序，y 标记完成 |
| Stack | 删一条 → 选 8 | 那条**回来了，且优先级没变** |

**最硬的一条判据是那个「杀掉进程重开」** —— 它证明数据真的落在磁盘上，而不是还在内存里骗你。

### 概念验收

能不看代码说出：

- `Count` 和 `Capacity` 有什么区别
- `for` 和 `foreach` 什么时候用哪个
- `break` / `continue` / `return` 各跳出什么
- `List` / `Queue` / `Stack` / `Dictionary` 各适合什么场景
- `Enum.Parse` 为什么必须存在（字符串和枚举是两个类型）

---

## 六、一句话记住

> **跨轮要用的东西，都在圈外面；写进去和读回来的文件名，必须是同一个字符串。**

---

# 进阶章节

基础功能做完之后补的四块，都是「真实项目里会遇到」的。

## 进阶 1：List vs Dictionary，谁快？

很多人以为 `Dictionary` 什么都快。实测打脸（20 万条数据）：

```
[List 统计]  Low=66972 Normal=66480 High=66548  耗时 = 2ms
[Dict 统计]  Low=66972 Normal=66480 High=66548  耗时 = 13ms    ← 慢 6 倍

[查找 1 万次] List 遍历 = 11217ms   Dictionary 直取 = 0ms      ← 快 11 秒
```

**结论：**

| 场景 | 谁快 | 为什么 |
|---|---|---|
| 遍历全部 + 简单累加 | **List** | 三个 `if` + 整数 +1，没有哈希开销 |
| 按键找单个元素 | **Dictionary** | 算一次哈希直达；List 要扫全表 |

**这就是数据结构课上说的 O(n) 和 O(1)** —— 今天终于看到了它的实际代价。

## 进阶 2：Dictionary of List —— 分组的标准套路

不做统计、做**分组**时，键是分组依据，值是「这一组的元素集合」：

```csharp
Dictionary<Priority, List<Todo>>     // 键=优先级，值=一堆任务
Dictionary<string, List<Todo>>       // 键=日期，值=那天要做的
Dictionary<int, List<string>>        // 键=周几，值=那天的课
```

**固定两行：**

```csharp
if (!groups.ContainsKey(key)) groups[key] = new List<T>();   // 没有就建
groups[key].Add(item);                                       // 往里塞
```

## 进阶 3：撤销的反面 —— 重做（Redo）

现在的撤销是「单向」的：撤销掉的操作**永久丢了**，没法重做。

真实编辑器用**两个 Stack**：

```csharp
Stack<string> undoStack = new();     // 撤销用
Stack<string> redoStack = new();     // 重做用

// 撤销时：从 undo 弹出 -> 执行反向 -> 塞进 redo
// 重做时：从 redo 弹出 -> 执行正向 -> 塞回 undo
// 执行新操作时：清空 redo（历史分叉了）
```

**「执行新操作要清空 redo」这条最容易漏** —— 不清空会重做到一个已经不存在的历史分支上。

## 进阶 4：用「内容」当身份标识是不严谨的

现在的撤销记录：

```csharp
history.Push("done|" + todos[n1 - 1].Content);
```

如果列表里有**两个「买菜」**，撤销会把**两个都改回未完成**。

**正确做法：给 Todo 加一个唯一 ID。**

```csharp
class Todo
{
    private static int _nextId = 1;
    public int Id { get; }                     // 每个任务唯一
    public string Content { get; }

    public Todo(string content, Priority level)
    {
        Id = _nextId++;
        Content = content;
        Level = level;
    }
}
```

然后撤销记录改成 `done|3`（记住 ID），凭 ID 找到那一个。

> **这就是数据库「主键」的由来** —— 用业务字段（名字）识别记录永远有重名风险。

**代价**：ID 也要存进文件、读回来也要恢复。所以这个改动会牵动保存格式 —— **这就是「加一个字段」的真实成本**。

---

# 练习题（答案在后面）

## 基础题

**1.** 下面输出什么？

```csharp
var q = new Queue<int>();
q.Enqueue(1); q.Enqueue(2); q.Enqueue(3);
Console.WriteLine(q.Dequeue());
Console.WriteLine(q.Peek());
Console.WriteLine(q.Count);
```

**2.** 补全下面代码，让它只打印**未完成**的任务：

```csharp
foreach (var t in todos)
{
    if (__________)
        Console.WriteLine(t.Content);
}
```

**3.** 下面代码有什么错？

```csharp
while (true)
{
    var history = new Stack<string>();
    history.Push("add|买菜");
}
```

## 进阶题

**4.** 用 Dictionary 统计每个优先级有几条任务，不用三个 if：

```csharp
var counts = new Dictionary<Priority, int>();
foreach (var t in todos)
{
    // 补全这两行
}
```

**5.** 下面这段为什么会出错？

```csharp
var groups = new Dictionary<Priority, List<Todo>>();
foreach (var t in todos)
    groups[t.Level].Add(t);
```

**6.** 要实现「撤销 + 重做」。当用户**撤销两次之后又做了新操作**，`redoStack` 应该怎么处理？为什么？

---

# 答案

**1.** `1` / `2` / `2`

`Dequeue` 拿走 1 并返回它；`Peek` 只看队头（还是 2）不拿走；`Count` 剩 2 个。

**2.** `if (!t.IsDone)`

`!` 是逻辑非 —— 「不成立」。这个符号你在 `if (!int.TryParse(...))` 里已经用过。

**3.** `history` 声明在 `while` **里面**，每轮循环都新建一个空栈，上一轮记的账全没了。

正确：挪到 `while` 外面，和 `todos` 并排。

**4.**

```csharp
foreach (var t in todos)
{
    if (!counts.ContainsKey(t.Level)) counts[t.Level] = 0;
    counts[t.Level]++;
}
```

**5.** 漏了 `ContainsKey` 判断。`groups[t.Level]` 是**读取**，读一个不存在的键会抛 `KeyNotFoundException`。

实测报错原文：

```
KeyNotFoundException — The given key 'Low' was not present in the dictionary.
```

**6.** **必须清空 `redoStack`。**

因为撤销两次后，历史处在「两个操作之前」那个状态。此时做新操作，历史就从这里**分叉**了 —— 原来那两条被撤销的操作永远回不去了，留着 `redoStack` 却会重做出错误的东西。

> 真实编辑器都是这么做的：**一旦产生新操作，重做链立即作废。**

---

# 遗留 & 下周

## 本周遗留（不影响产出物）

- [ ] `case 8` 里 `done` 撤销用内容匹配，重名会误伤 —— 需要唯一 ID 才能根治
- [ ] 优先级在「添加」时写死成 `Normal`，没让用户选
- [ ] 删除 `idx` 越界（如输 99）会抛 `ArgumentOutOfRangeException`，还没兜
- [ ] `todos.RemoveAll(t => t.Content == p[1])` 里的 `=>` 是 Lambda，第 10 周才正式学

## 下周（第 9 周）

> **委托 / 事件 / Action·Func**
> 产出：自己写一个事件回调小例子

这一周的所有功能都是「我自己调用」。下周开始学**「别人调我」**——

- 任务从「未完成」变成「完成」时，自动触发通知
- 但 `Todo` 不该知道通知是怎么发的
- 这就是 **事件（event）** 要解决的问题

**提前想一下**：你的 `case 3` 标记完成之后，有哪几处需要「跟着做点什么」？（保存？打印？撤销记账？）

—— 这些「跟着做的事」现在散落在各处，下周会用事件把它们收拢。
