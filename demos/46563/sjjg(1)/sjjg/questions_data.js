window.QUESTIONS_DATA = [
  {
    "id": "mc_intro_algo_properties",
    "filename": "1781690116392.jpg",
    "chapter": "第1章 绪论",
    "type": "choice",
    "question": "下面（）不是算法所必须具备的特性。",
    "options": [
      "A. 有穷性",
      "B. 确切性",
      "C. 高效性",
      "D. 可行性"
    ],
    "correct_answer": 2,
    "explanation": "算法具有五个基本特征：有穷性、确定性（确切性）、可行性、输入和输出。高效性是评价算法优劣的目标指标，而不是算法的基本定义特征。",
    "question_number": 1
  },
  {
    "id": "mc_intro_algo_definition",
    "filename": "1781690116392.jpg",
    "chapter": "第1章 绪论",
    "type": "choice",
    "question": "一个算法应该是（）。",
    "options": [
      "A. 程序",
      "B. 问题求解步骤的描述",
      "C. 要满足五个基本特性",
      "D. B和C"
    ],
    "correct_answer": 1,
    "explanation": "算法是问题求解步骤的描述，且它必须满足有穷、确定、可行等五个基本特性。程序只是算法的一种特定语言实现形式，算法本身独立于程序。",
    "question_number": 2
  },
  {
    "id": "mc_intro_struct_independent",
    "filename": "1781690116392.jpg",
    "chapter": "第1章 绪论",
    "type": "choice",
    "question": "以下与数据的存储结构无关的术语是（）。",
    "options": [
      "A. 循环队列",
      "B. 链表",
      "C. 哈希表",
      "D. 栈"
    ],
    "correct_answer": 3,
    "explanation": "栈是一种只允许在一段进行插入和删除操作的线性逻辑结构，其定义与具体的物理存储方式（顺序或链式）无关。而循环队列、链表、哈希表都指代了具体的存储方式。",
    "question_number": 3
  },
  {
    "id": "mc_intro_nonlinear_struct",
    "filename": "1781690116392.jpg",
    "chapter": "第1章 绪论",
    "type": "choice",
    "question": "以下数据结构中，（）是非线性数据结构。",
    "options": [
      "A. 树",
      "B. 字符串",
      "C. 队列",
      "D. 栈"
    ],
    "correct_answer": 0,
    "explanation": "树中的元素是一对多的层次关系，属于非线性数据结构。字符串、队列和栈的元素都是一对一的线性结构。",
    "question_number": 4
  },
  {
    "id": "mc_intro_linklist_disadvantage",
    "filename": "1781690116392.jpg",
    "chapter": "第1章 绪论",
    "type": "choice",
    "question": "链表不具有的特点是（）。",
    "options": [
      "A. 所需空间与线性表长度成正比",
      "B. 插入删除不需要移动元素",
      "C. 不必事先估计存储空间",
      "D. 可随机访问任一元素"
    ],
    "correct_answer": 3,
    "explanation": "链表因为每个节点之间通过指针相连，必须从头指针开始顺序遍历查找，不能像数组（顺序表）那样通过下标进行 O(1) 的随机存取。",
    "question_number": 5
  },
  {
    "id": "mc_intro_seq_delete_moves",
    "filename": "1781690116392.jpg",
    "chapter": "第1章 绪论",
    "type": "choice",
    "question": "在一个长度为 n 的顺序表中删除第 i 个元素（0 < i <= n）时，需要向前移动（）个元素。",
    "options": [
      "A. n-i",
      "B. n-i+1",
      "C. n-i-1",
      "D. i+1"
    ],
    "correct_answer": 0,
    "explanation": "在长度为 n 的顺序表中，删除第 i 个元素（对应数组索引 i-1），需要把该位置后面的所有元素（从第 i+1 个元素到第 n 个元素）均向前移动一位。这些移动的元素个数为 n - i 个。",
    "question_number": 6
  },
  {
    "id": "mc_intro_linklist_address",
    "filename": "1781690116392.jpg",
    "chapter": "第1章 绪论",
    "type": "choice",
    "question": "线性表采用链式存储时，其物理存储地址（）。",
    "options": [
      "A. 必须是连续的",
      "B. 一定是不连续的",
      "C. 部分地址必须连续",
      "D. 连续与否均可以"
    ],
    "correct_answer": 3,
    "explanation": "链式存储中，各个节点在内存中的物理存放地址是任意的，可以是连续的也可以是不连续的，完全依靠节点的指针字段来连接维护逻辑顺序。",
    "question_number": 7
  },
  {
    "id": "mc_intro_linear_definition",
    "filename": "1781690116392.jpg",
    "chapter": "第1章 绪论",
    "type": "choice",
    "question": "线性表是（）。",
    "options": [
      "A. 一个有限序列，可以为空",
      "B. 一个有限序列，不可以为空",
      "C. 一个无限序列，可以为空",
      "D. 一个无限序列，不可以为空"
    ],
    "correct_answer": 0,
    "explanation": "线性表是具有相同数据类型的数据元素的有限序列。线性表中的元素个数定义为线性表的长度，长度为 0 的线性表称为空表。因此，线性表是有限的，且可以为空。",
    "question_number": 8
  },
  {
    "id": "q4",
    "filename": "1781690116200.jpg",
    "chapter": "第2章 数组与存储结构",
    "type": "calculation",
    "question": "已知二维数组B[12][6]，每个元素占2个字节，数组在内存中的起始地址为5000。请计算：\n1) 数组B共占用多少字节？\n2) 数组B最后一个元素的存储地址是多少？\n3) 采用行优先顺序存储该数组，元素 B[8][4]的地址是多少？\n4) 采用列优先顺序存储该数组，元素 B[8][4]的地址是多少？",
    "answer": "1) 144 字节\n2) 5142\n3) 5104\n4) 5112",
    "explanation": "计算公式：\n1) 数组B共 12 * 6 = 72 个元素，总大小为 72 * 2 = 144 字节。\n2) 最后一个元素为 B[11][5]，地址 = 5000 + (11 * 6 + 5) * 2 = 5000 + 71 * 2 = 5142。\n3) 行优先下 B[8][4] 地址 = 5000 + (8 * 6 + 4) * 2 = 5000 + 52 * 2 = 5104。\n4) 列优先下 B[8][4] 地址 = 5000 + (4 * 12 + 8) * 2 = 5000 + 56 * 2 = 5112。"
  },
  {
    "id": "mc_linklist_save_time",
    "filename": "1781690116381.jpg",
    "chapter": "第2章 线性表",
    "type": "choice",
    "question": "如果某线性表最常用的操作是取第 i 个结点及其前驱，则采用（）存储方式最节省时间。",
    "options": [
      "A. 单链表",
      "B. 双向链表",
      "C. 单循环链表",
      "D. 顺序表"
    ],
    "correct_answer": 3,
    "explanation": "顺序表具有随机存取的特性，可以在 O(1) 时间内直接定位到第 i 个元素及其前驱节点。而任何链式存储查找第 i 个节点都需要从头遍历，时间复杂度为 O(n)。",
    "question_number": 1
  },
  {
    "id": "mc_linklist_address_calc",
    "filename": "1781690116381.jpg",
    "chapter": "第2章 线性表",
    "type": "choice",
    "question": "一个顺序存储线性表的第一个元素的存储地址是 90，每个元素的长度是 2，则第 6 个元素的存储地址是（）。",
    "options": [
      "A. 98",
      "B. 100",
      "C. 102",
      "D. 106"
    ],
    "correct_answer": 1,
    "explanation": "顺序表中第 i 个元素的地址公式为：Loc(ai) = Loc(a1) + (i-1) * L。这里 Loc(a1)=90, L=2, i=6，所以 Loc(a6) = 90 + (6-1)*2 = 100。",
    "question_number": 2
  },
  {
    "id": "mc_linklist_read_fastest",
    "filename": "1781690116381.jpg",
    "chapter": "第2章 线性表",
    "type": "choice",
    "question": "在线性表的下列存储结构中，读取第 i 个元素花费时间最少的是（）。",
    "options": [
      "A. 单链表",
      "B. 双链表",
      "C. 循环链表",
      "D. 顺序表"
    ],
    "correct_answer": 3,
    "explanation": "顺序表支持随机存取，访问任意元素的时间复杂度均为 O(1)，其他链表均需要 O(n) 的遍历时间。",
    "question_number": 3
  },
  {
    "id": "mc_linklist_delete_post",
    "filename": "1781690116381.jpg",
    "chapter": "第2章 线性表",
    "type": "choice",
    "question": "在单链表中删除指针 p 所指结点的后继结点，则执行（）操作。",
    "options": [
      "A. p->next = p->next->next",
      "B. p->next = p",
      "C. p = p->next->next",
      "D. p->next = p->next"
    ],
    "correct_answer": 0,
    "explanation": "要删除节点 p 的后继节点，只需将 p 的 next 指针指向后继节点的后继节点，使得中间的节点被断开，即 p->next = p->next->next。",
    "question_number": 4
  },
  {
    "id": "mc_linklist_insert_between",
    "filename": "1781690116381.jpg",
    "chapter": "第2章 线性表",
    "type": "choice",
    "question": "在一个单链表中，已知 q 所指结点是 p 所指结点的前驱，若在 q 和 p 之间插入 s 所指的结点，则执行（）操作。",
    "options": [
      "A. s->next = p->next; p->next = s",
      "B. q->next = s; s->next = p",
      "C. q->next = s->next; s->next = p",
      "D. p->next = s; s->next = q"
    ],
    "correct_answer": 1,
    "explanation": "在 q 和 p 之间插入新节点 s（且已知 q 的后继是 p）：应先将 q 的 next 指向 s (q->next = s)，再将 s 的 next 指向 p (s->next = p)。",
    "question_number": 5
  },
  {
    "id": "mc_stack_output_sequence",
    "filename": "1781690116373.jpg",
    "chapter": "第3章 栈与队列",
    "type": "choice",
    "question": "一个栈的输入序列是 a, b, c, d, e，则栈的不可能输出的序列是（）。",
    "options": [
      "A. a, b, c, d, e",
      "B. d, e, c, b, a",
      "C. d, c, e, a, b",
      "D. e, d, c, b, a"
    ],
    "correct_answer": 2,
    "explanation": "栈具有后进先出的特性。对于选项C 'd, c, e, a, b'：\n- 输出d和c代表已入栈a,b,c,d，且d,c已被弹出，此时栈中自底向上为a,b。\n- 接着入栈e并弹出e，此时栈内依然是a,b。\n- 接下来只能弹出栈顶的b，而不能先弹出底部的a。所以不可能输出'a, b'，只能是'b, a'。故C是不可能的。",
    "question_number": 1
  },
  {
    "id": "mc_stack_n_k_output",
    "filename": "1781690116373.jpg",
    "chapter": "第3章 栈与队列",
    "type": "choice",
    "question": "若一个栈的输入序列是 1, 2, 3, ..., n，输出序列的第一个元素是 n，则第 k 个输出元素是（）。",
    "options": [
      "A. k",
      "B. n-k-1",
      "C. n-k+1",
      "D. 不确定"
    ],
    "correct_answer": 2,
    "explanation": "如果第一个弹出的元素是 n，表示 1 到 n 已经全部按顺序压入栈中。此时栈的状态自顶向下依次是 n, n-1, n-2, ..., 1。因此，第 1 个输出的是 n-1+1 = n，第 k 个输出的就是 n-k+1。",
    "question_number": 2
  },
  {
    "id": "mc_stack_empty_condition",
    "filename": "1781690116373.jpg",
    "chapter": "第3章 栈与队列",
    "type": "choice",
    "question": "判定一个栈 S（最多有 n 个元素）为空的条件是（）。",
    "options": [
      "A. S->top != 0",
      "B. S->top == 0",
      "C. S->top != n",
      "D. S->top == n"
    ],
    "correct_answer": 1,
    "explanation": "在顺序栈的设计中，通常用 top 指针表示栈顶位置。当 top == 0 时，表示栈为空。",
    "question_number": 3
  },
  {
    "id": "mc_stack_push_pop_impossibility",
    "filename": "1781690116373.jpg",
    "chapter": "第3章 栈与队列",
    "type": "choice",
    "question": "若一个栈的输入序列是 1, 2, 3, 4, 5, 6，其输出序列是 p1, p2, p3, p4, p5, p6，若 p1=3，则 p2 的值（）。",
    "options": [
      "A. 一定是 2",
      "B. 一定是 1",
      "C. 不可能是 1",
      "D. 以上都不对"
    ],
    "correct_answer": 2,
    "explanation": "p1 = 3 说明 1, 2, 3 已入栈，且 3 已出栈。此时栈中自底向上是 1, 2，栈顶元素为 2。\n- 下一步可以是 2 直接出栈（p2 = 2）；也可以是 4 先入栈再出栈（p2 = 4）；也可以是 4, 5 入栈，5出栈（p2 = 5）等。\n- 但是，无论如何，要弹出 1，必须先弹出 2。因此在 2 还没有被弹出之前，p2 不可能是 1。所以C正确。",
    "question_number": 4
  },
  {
    "id": "mc_queue_empty_condition",
    "filename": "1781690116373.jpg",
    "chapter": "第3章 栈与队列",
    "type": "choice",
    "question": "判定一个队列 Q（最多有 n 个元素，采用循环队列结构）为空的条件是（）。",
    "options": [
      "A. Q->rear - Q->front == n",
      "B. Q->rear - Q->front + 1 == n",
      "C. Q->rear == Q->front",
      "D. Q->rear + 1 == Q->front"
    ],
    "correct_answer": 2,
    "explanation": "在循环队列中，约定 front 指向队头元素的前一位置，rear 指向队尾元素。当 front == rear 时，队列为空。",
    "question_number": 5
  },
  {
    "id": "mc_queue_chain_insert",
    "filename": "1781690116373.jpg",
    "chapter": "第3章 栈与队列",
    "type": "choice",
    "question": "在一个链队列中，假定 front 和 rear 分别为头指针和尾指针，则插入一个结点 *S 的操作是（）。",
    "options": [
      "A. front = front->next",
      "B. S->next = rear; rear = S",
      "C. rear->next = S; rear = S",
      "D. S->next = front; front = S"
    ],
    "correct_answer": 2,
    "explanation": "在链队列尾部插入一个新节点 S 的步骤是：首先将当前尾节点的 next 指针指向 S (rear->next = S)，然后更新尾指针 rear 指向新插入的节点 S (rear = S)。",
    "question_number": 6
  },
  {
    "id": "mc_queue_chain_delete",
    "filename": "1781690116373.jpg",
    "chapter": "第3章 栈与队列",
    "type": "choice",
    "question": "在一个链队列中，假定 front 和 rear 分别为头指针和尾指针，删除一个结点的操作是（）。",
    "options": [
      "A. front = front->next",
      "B. rear = rear->next",
      "C. rear->next = front",
      "D. front->next = rear"
    ],
    "correct_answer": 0,
    "explanation": "在带头节点的单链队列中，删除队头元素实际上是将头指针指向其后继节点。即 front = front->next。",
    "question_number": 7
  },
  {
    "id": "mc_tree_degree_calculation",
    "filename": "1781690116346.jpg",
    "chapter": "第4章 树与二叉树",
    "type": "choice",
    "question": "设一棵二叉树度为 2 的结点数是 7，度为 1 的结点数是 6，则叶子结点（度为 0 的结点）数是（）。",
    "options": [
      "A. 6",
      "B. 7",
      "C. 8",
      "D. 9"
    ],
    "correct_answer": 2,
    "explanation": "对任意二叉树，度为 0 的节点数 n0 与度为 2 的节点数 n2 满足公式 n0 = n2 + 1。题目给出 n2 = 7，因此 n0 = 7 + 1 = 8。",
    "question_number": 4
  },
  {
    "id": "mc_tree_full_binary_nodes",
    "filename": "1781690116346.jpg",
    "chapter": "第4章 树与二叉树",
    "type": "choice",
    "question": "对一个满二叉树，m 个树叶，k 个分枝结点，n 个结点，则（）。",
    "options": [
      "A. n = m + 1",
      "B. m + 1 = 2n",
      "C. m = k - 1",
      "D. n = 2k + 1"
    ],
    "correct_answer": 3,
    "explanation": "在非空满二叉树中（这里指度为0或2的二叉树），分支节点数 k 与叶子节点数 m 满足关系 m = k + 1。总节点数 n = m + k = (k + 1) + k = 2k + 1。",
    "question_number": 5
  },
  {
    "id": "mc_tree_huffman_wpl",
    "filename": "1781690116346.jpg",
    "chapter": "第4章 树与二叉树",
    "type": "choice",
    "question": "权值为 {1, 2, 6, 8} 的四个结点构成的哈夫曼树的带权路径长度 (WPL) 是（）。",
    "options": [
      "A. 18",
      "B. 28",
      "C. 19",
      "D. 29"
    ],
    "correct_answer": 3,
    "explanation": "哈夫曼树构造过程：\n1. 选出最小的两个权值 1 和 2 合并，新节点权值为 3。\n2. 在 {3, 6, 8} 中选出 3 和 6 合并，新节点权值为 9。\n3. 合并 9 和 8，根节点权值为 17。\n- 各节点的路径长度（层数）：1(3层), 2(3层), 6(2层), 8(1层)。\n- WPL = 1*3 + 2*3 + 6*2 + 8*1 = 3 + 6 + 12 + 8 = 29。",
    "question_number": 7
  },
  {
    "id": "mc_tree_k_level_nodes",
    "filename": "1781690116346.jpg",
    "chapter": "第4章 树与二叉树",
    "type": "choice",
    "question": "二叉树第 k 层上最多有（）个结点。",
    "options": [
      "A. 2^k",
      "B. 2^(k-1)",
      "C. 2^k - 1",
      "D. 2^(k+1)"
    ],
    "correct_answer": 1,
    "explanation": "根据二叉树的性质，在二叉树的第 i 层上最多有 2^(i-1) 个节点 (i >= 1)。",
    "question_number": 8
  },
  {
    "id": "mc_tree_depth_k_max_nodes",
    "filename": "1781690116346.jpg",
    "chapter": "第4章 树与二叉树",
    "type": "choice",
    "question": "二叉树的深度为 k，则该二叉树最多有（）个结点。",
    "options": [
      "A. 2^k",
      "B. 2^k - 1",
      "C. 2^k + 1",
      "D. 2^(k+1)"
    ],
    "correct_answer": 1,
    "explanation": "深度为 k 的二叉树最多有 2^k - 1 个节点（即满二叉树的状态）。",
    "question_number": 10
  },
  {
    "id": "mc_tree_best_representation",
    "filename": "1781690116346.jpg",
    "chapter": "第4章 树与二叉树",
    "type": "choice",
    "question": "树最适合于用来表示（）。",
    "options": [
      "A. 线性结构的数据",
      "B. 顺序结构的数据",
      "C. 元素之间无前驱和后继关系的数据",
      "D. 元素之间有包含和层次关系的数据"
    ],
    "correct_answer": 3,
    "explanation": "树结构是一种非线性数据结构，最适合用来表现具有包含关系或分支层次结构的数据。",
    "question_number": 13
  },
  {
    "id": "mc_tree_pre_in_to_post",
    "filename": "1781690116346.jpg",
    "chapter": "第4章 树与二叉树",
    "type": "choice",
    "question": "设某一二叉树先序遍历为 abdec，中序遍历为 dbeac，则该二叉树后序遍历的顺序是（）。",
    "options": [
      "A. abdec",
      "B. debac",
      "C. debca",
      "D. abcde"
    ],
    "correct_answer": 2,
    "explanation": "先序 abdec 指示根是 a。中序 dbeac 告诉我们 a 的左子树有 dbe，右子树有 c。\n- 对于左子树，先序为 bde，根是 b。中序为 dbe，则 d 是 b 的左孩子，e 是 b 的右孩子。\n- 重建后，后序遍历（左右根）得到 debca。",
    "question_number": 14
  },
  {
    "id": "mc_tree_in_post_to_pre",
    "filename": "1781690116346.jpg",
    "chapter": "第4章 树与二叉树",
    "type": "choice",
    "question": "设某一二叉树中序遍历为 badce，后序遍历为 bdeca，则该二叉树先序遍历的顺序是（）。",
    "options": [
      "A. adbec",
      "B. decab",
      "C. debac",
      "D. abcde"
    ],
    "correct_answer": 3,
    "explanation": "后序 bdeca 指示根是 a。中序 badce 告诉我们 a 的左子树有 b，右子树有 dce。\n- 对于右子树，后序为 dec，根是 c。中序 dce 告诉我们 d 是左孩子，e 是右孩子。\n- 结合根 a 和左孩子 b，先序（根左右）结果为 abcde。",
    "question_number": 14
  },
  {
    "id": "q5",
    "filename": "1781690116213.jpg",
    "chapter": "第4章 树与二叉树",
    "type": "drawing",
    "question": "已知一棵二叉树的先序遍历序列：GDBACEFIHKJ，中序遍历序列：ABCDEFGHK。请画出该二叉树，并写出它的后序遍历序列。",
    "answer": "后序遍历序列为：ACBFEDJHKIG",
    "explanation": "重建二叉树步骤：\n1. 先序首位G为根。中序中G右侧为HK，左侧为ABCDEF。因此左子树含有{A, B, C, D, E, F}，右子树含有{H, K}。\n2. 先序中紧随其后的是D，所以左子树根为D。中序中D左侧为ABC，右侧为EF。\n3. 重复此方法重建整棵树。\n- 左子树根为D，D的左子树根为B（中序中B左侧为A，右侧为C），D的右子树根为F（中序中F左侧为E）。\n- 右子树根为I（由先序G之后对应的右子序列确定，包含I,H,K,J）。根I的左子树根为H，右子树为K,J。\n后序遍历为：ACBFEDJHKIG。"
  },
  {
    "id": "q7",
    "filename": "1781690116244.jpg",
    "chapter": "第4章 树与二叉树",
    "type": "drawing",
    "question": "假设一棵二叉树的后序序列为 DECGBFMLKJIA，中序序列为 DCEBGAFMIJLK，请画出这棵二叉树并写出它的先序遍历序列。",
    "answer": "先序遍历序列为：ABDECIGFJKLM",
    "explanation": "重建二叉树步骤：\n- 后序序列最后一位A为根。中序序列中A左边为DCEBG，右边为FMIJLK。\n- 左子树后序为DECGB，对应的中序为DCEBG。后序中B为左子树的根。中序中B左边为DCE，右边为G...\n- 依次还原，得到这棵二叉树。先序遍历结果为：ABDECIGFJKLM。"
  },
  {
    "id": "mc_graph_indegree_outdegree",
    "filename": "1781690116318.jpg",
    "chapter": "第5章 图",
    "type": "choice",
    "question": "在一个有向图中，所有顶点的入度之和等于所有顶点的出度之和的（）倍。",
    "options": [
      "A. 1/2",
      "B. 1",
      "C. 2",
      "D. 4"
    ],
    "correct_answer": 1,
    "explanation": "有向图中每条弧都会给一个顶点贡献一个出度，给另一个顶点贡献一个入度。因此所有顶点的入度之和必然等于出度之和（两者均等于边数E）。也就是入度之和是出度之和的1倍。",
    "question_number": 1
  },
  {
    "id": "mc_graph_mst_min_edges",
    "filename": "1781690116318.jpg",
    "chapter": "第5章 图",
    "type": "choice",
    "question": "一个具有 n 个顶点的无向连通图至少包含（）条边。",
    "options": [
      "A. n",
      "B. n+1",
      "C. n-1",
      "D. n/2"
    ],
    "correct_answer": 2,
    "explanation": "一个具有 n 个顶点的无向连通图，要使其连通且边数最少，这棵图就是一棵树，其边数必然为 n-1 条。",
    "question_number": 2
  },
  {
    "id": "mc_graph_undirected_complete_edges",
    "filename": "1781690116318.jpg",
    "chapter": "第5章 图",
    "type": "choice",
    "question": "一个具有 n 个顶点的无向完全图包含（）条边。",
    "options": [
      "A. n(n-1)",
      "B. n(n+1)",
      "C. n(n-1)/2",
      "D. n(n+1)/2"
    ],
    "correct_answer": 2,
    "explanation": "无向完全图中任意两个顶点之间都有边，因此总边数为组合数 C(n, 2) = n(n-1)/2。",
    "question_number": 3
  },
  {
    "id": "mc_graph_directed_complete_edges",
    "filename": "1781690116318.jpg",
    "chapter": "第5章 图",
    "type": "choice",
    "question": "一个具有 n 个顶点的有向完全图包含（）条边。",
    "options": [
      "A. n(n-1)",
      "B. n(n+1)",
      "C. n(n-1)/2",
      "D. n(n+1)/2"
    ],
    "correct_answer": 0,
    "explanation": "有向完全图中任意两个顶点之间都有双向的弧，因此总弧数为排列数 P(n, 2) = n(n-1)。",
    "question_number": 4
  },
  {
    "id": "mc_graph_adj_list_edges",
    "filename": "1781690116318.jpg",
    "chapter": "第5章 图",
    "type": "choice",
    "question": "在有向图的邻接表中，每个顶点邻接链表链接着该顶点所有的（）邻接点。",
    "options": [
      "A. 入边",
      "B. 出边",
      "C. 入边和出边",
      "D. 不是入边也不是出边"
    ],
    "correct_answer": 1,
    "explanation": "邻接表主要是为了查找从某顶点出发的边（出边）。因此，邻接表中的顶点链表存储的是指向该顶点出边终点的邻接点。",
    "question_number": 5
  },
  {
    "id": "mc_graph_inv_adj_list_edges",
    "filename": "1781690116318.jpg",
    "chapter": "第5章 图",
    "type": "choice",
    "question": "在有向图的逆邻接表中，每个顶点邻接链表链接着该顶点所有的（）邻接点。",
    "options": [
      "A. 入边",
      "B. 出边",
      "C. 入边和出边",
      "D. 不是入边也不是出边"
    ],
    "correct_answer": 0,
    "explanation": "逆邻接表与邻接表相反，它是为了方便寻找进入该顶点的弧（入边）而建立的。所以顶点链表中链接的是指向该顶点的弧的起点。",
    "question_number": 6
  },
  {
    "id": "mc_graph_adj_list_structure",
    "filename": "1781690116318.jpg",
    "chapter": "第5章 图",
    "type": "choice",
    "question": "邻接表是图的一种（）存储结构。",
    "options": [
      "A. 顺序存储结构",
      "B. 链式存储结构",
      "C. 索引存储结构",
      "D. 散列存储结构"
    ],
    "correct_answer": 1,
    "explanation": "邻接表为图的每个顶点建立一个单链表，是一种典型的链式存储结构。",
    "question_number": 7
  },
  {
    "id": "mc_graph_traversal_errors",
    "filename": "1781690116318.jpg",
    "chapter": "第5章 图",
    "type": "choice",
    "question": "下列有关图遍历的说法不正确的是（）。",
    "options": [
      "A. 连通图的深度优先搜索是一个递归过程",
      "B. 图的广度优先搜索中邻接点的寻找具有“先进先出”的特征",
      "C. 非连通图不能用深度优先搜索法",
      "D. 图的遍历要求每一顶点仅被访问一次"
    ],
    "correct_answer": 2,
    "explanation": "非连通图同样可以使用深度（或广度）优先搜索。只需在算法中对每一个未被访问的顶点再次调用 DFS 函数，就可以遍历整个非连通图的所有连通分量。因此C不正确。",
    "question_number": 8
  },
  {
    "id": "mc_search_struct_requirement",
    "filename": "1781690116290.jpg",
    "chapter": "第7章 查找",
    "type": "choice",
    "question": "顺序查找法与二分查找法对存储结构的要求是（）。",
    "options": [
      "A. 顺序查找与二分查找均只适用于顺序表",
      "B. 顺序查找与二分查找均既适用于顺序表，也适用于链表",
      "C. 顺序查找适用于顺序表和链表，二分查找只适用于顺序表",
      "D. 二分查找适用于顺序表和链表"
    ],
    "correct_answer": 2,
    "explanation": "顺序查找非常灵活，既可以用在顺序表上也可以用在链表上。而二分查找（折半查找）因为需要随机定位中间元素，所以必须要求线性表以顺序存储方式存储，且元素有序。",
    "question_number": 1
  },
  {
    "id": "mc_search_binary_requirement",
    "filename": "1781690116298.jpg",
    "chapter": "第7章 查找",
    "type": "choice",
    "question": "对线性表进行二分查找的时候，要求线性表必须（）。",
    "options": [
      "A. 以顺序存储方式",
      "B. 以链接存储方式",
      "C. 以顺序存储方式，且数据元素有序",
      "D. 以链接存储方式，且数据元素有序"
    ],
    "correct_answer": 2,
    "explanation": "二分查找有两个核心前提要求：一是必须采用顺序存储结构，二是表中的数据元素必须按关键字有序排列。",
    "question_number": 2
  },
  {
    "id": "mc_search_list_characteristics_1",
    "filename": "1781690116298.jpg",
    "chapter": "第7章 查找",
    "type": "choice",
    "question": "在线性表的存储结构中，（）查找、插入和删除速度慢，但顺序存储和随机存取第i个元素速度快。",
    "options": [
      "A. 顺序表",
      "B. 链接表",
      "C. 散列表",
      "D. 索引表"
    ],
    "correct_answer": 0,
    "explanation": "顺序表支持 O(1) 的随机存取，但插入和删除需要移动大量元素，且如果是有序表查找仍需 O(n)（除非是二分查找），因此在此选项描述下代表顺序表。",
    "question_number": 3
  },
  {
    "id": "mc_search_list_characteristics_2",
    "filename": "1781690116298.jpg",
    "chapter": "第7章 查找",
    "type": "choice",
    "question": "在（）上查找、插入和删除速度快，但不能进行顺序存取。",
    "options": [
      "A. 顺序表",
      "B. 链接表",
      "C. 顺序有序表",
      "D. 散列表"
    ],
    "correct_answer": 3,
    "explanation": "散列表（哈希表）支持接近 O(1) 的平均查找、插入和删除性能，但由于元素是无序存放的，它无法实现顺序存取。",
    "question_number": 4
  },
  {
    "id": "mc_search_list_characteristics_3",
    "filename": "1781690116298.jpg",
    "chapter": "第7章 查找",
    "type": "choice",
    "question": "在（）上插入、删除和顺序存取速度快，但查找速度慢。",
    "options": [
      "A. 顺序表",
      "B. 链接表",
      "C. 顺序有序表",
      "D. 散列表"
    ],
    "correct_answer": 1,
    "explanation": "链表（链接表）在已知节点位置的情况下插入和删除仅需修改指针，并且非常适合顺序存取，但是不能随机访问，查找任意元素需要从头遍历，速度较慢。",
    "question_number": 5
  },
  {
    "id": "mc_search_seq_avg_compare",
    "filename": "1781690116298.jpg",
    "chapter": "第7章 查找",
    "type": "choice",
    "question": "采用顺序查找方法查找长度为 n 的线性表，查找每个元素的平均比较次数（等概率下）为（）。",
    "options": [
      "A. n",
      "B. n/2",
      "C. (n+1)/2",
      "D. (n-1)/2"
    ],
    "correct_answer": 2,
    "explanation": "在等概率下，顺序查找的平均查找长度 ASL = 1/n * Σ(i) = 1/n * [n(n+1)/2] = (n+1)/2 次。",
    "question_number": 6
  },
  {
    "id": "q31",
    "filename": "1781690116447.jpg",
    "chapter": "第7章 查找",
    "type": "calculation",
    "question": "使用散列函数 H(key) = key % 11，把一个整数值转换成散列表下标，现要把数据｛1, 13, 12, 34, 38, 33, 27, 22｝依次插入散列表。\n请写出：\n1）使用线性探测法来构造的散列表状态。\n2）使用链地址法构造的散列表状态。",
    "answer": "1) 线性探测法列表 (长度11): \n下标 0: 22, 下标 1: 1, 下标 2: 13, 下标 3: 12, 下标 4: 34, 下标 5: 38, 下标 6: 33, 下标 7: 27, 下标 8-10: 空\n2) 链地址法 (拉链法):\n0 -> 33 -> 22, 1 -> 1, 2 -> 13, 1 -> 12, 5 -> 38, 6 -> 27, 其它为空",
    "explanation": "哈希表插入计算过程：\n- H(1) = 1, H(13) = 2, H(12) = 1, H(34) = 1, H(38) = 5, H(33) = 0, H(27) = 5, H(22) = 0。\n1. 线性探测冲突解决：\n- 1 -> 下标1\n- 13 -> 下标2\n- 12 % 11 = 1 (冲突) -> 探测下标2(冲突) -> 探测下标3(放入)\n- 34 % 11 = 1 (冲突) -> 探测2(冲突) -> 3(冲突) -> 4(放入)\n- 38 % 11 = 5 -> 下标5\n- 33 % 11 = 0 -> 下标0\n- 27 % 11 = 5 (冲突) -> 探测6(放入)\n- 22 % 11 = 0 (冲突) -> 探测1,2,3,4,5,6(冲突) -> 7(放入)\n\n2. 链地址法直接将相同哈希值的节点链接到对应下标的单链表头部/尾部。"
  },
  {
    "id": "mc_sort_avg_worst",
    "filename": "1781690116268.jpg",
    "chapter": "第8章 排序",
    "type": "choice",
    "question": "（ ）在平均情况下，时间复杂度为 O(n*log2(n))，空间复杂度为 O(n)；但在最坏情况下时间复杂度为 O(n^2)。",
    "options": [
      "A. 希尔排序",
      "B. 快速排序",
      "C. 堆排序",
      "D. 归并排序"
    ],
    "correct_answer": 1,
    "explanation": "快速排序在平均情况下时间复杂度为 O(nlogn)，最坏情况下（例如数组已经有序或逆序）退化为 O(n^2)。它的空间复杂度主要来自于递归调用栈，平均为 O(logn)。",
    "question_number": 1
  },
  {
    "id": "mc_sort_best_efficiency",
    "filename": "1781690116268.jpg",
    "chapter": "第8章 排序",
    "type": "choice",
    "question": "在待排序元素基本有序的情况下，效率最高的排序方法是（）。",
    "options": [
      "A. 插入排序",
      "B. 快速排序",
      "C. 堆排序",
      "D. 归并排序"
    ],
    "correct_answer": 0,
    "explanation": "在待排序序列基本有序的情况下，直接插入排序只需要进行很少的比较和移动，时间复杂度接近 O(n)，是效率最高的排序方法。",
    "question_number": 2
  },
  {
    "id": "mc_sort_max_memory",
    "filename": "1781690116268.jpg",
    "chapter": "第8章 排序",
    "type": "choice",
    "question": "下面几种排序方法中，要求辅助内存量最大的是（）。",
    "options": [
      "A. 插入排序",
      "B. 交换排序",
      "C. 选择排序",
      "D. 归并排序"
    ],
    "correct_answer": 3,
    "explanation": "归并排序需要与原序列相同长度的辅助空间来合并子序列，空间复杂度为 O(n)，是常用排序方法中辅助内存要求最大的。",
    "question_number": 3
  },
  {
    "id": "mc_sort_compare_independent",
    "filename": "1781690116268.jpg",
    "chapter": "第8章 排序",
    "type": "choice",
    "question": "在下列排序方法中，关键字比较的次数与记录的初始排列秩序无关的是（）方法。",
    "options": [
      "A. 希尔排序",
      "B. 冒泡排序",
      "C. 插入排序",
      "D. 选择排序"
    ],
    "correct_answer": 3,
    "explanation": "简单选择排序的关键字比较次数总是恒定的 n(n-1)/2 次，与记录的初始排列顺序完全无关。",
    "question_number": 4
  },
  {
    "id": "mc_sort_insert_definition",
    "filename": "1781690116275.jpg",
    "chapter": "第8章 排序",
    "type": "choice",
    "question": "从未排序序列中依次取出元素与已经排好序的序列中的元素作比较，将其放入已排序序列的正确位置上，此方法称为（）。",
    "options": [
      "A. 插入排序",
      "B. 选择排序",
      "C. 交换排序",
      "D. 归并排序"
    ],
    "correct_answer": 0,
    "explanation": "这是直接插入排序的定义。它把待排序的记录按其关键字值的大小插入到前面已经排好序的子序列中的适当位置。",
    "question_number": 5
  },
  {
    "id": "mc_sort_select_definition",
    "filename": "1781690116275.jpg",
    "chapter": "第8章 排序",
    "type": "choice",
    "question": "从未排序序列中挑选元素，并将其放入已排序序列的一端，此方法称为（）。",
    "options": [
      "A. 插入排序",
      "B. 交换排序",
      "C. 选择排序",
      "D. 归并排序"
    ],
    "correct_answer": 2,
    "explanation": "这是选择排序的定义。每一趟从待排序的记录中选出关键字最小（或最大）的记录，顺序放在已排好序的序列最后，直到全部排完。",
    "question_number": 6
  },
  {
    "id": "mc_sort_merge_definition",
    "filename": "1781690116275.jpg",
    "chapter": "第8章 排序",
    "type": "choice",
    "question": "依次将每两个相邻的有序表合并成一个有序表的排序方法称为（）。",
    "options": [
      "A. 插入排序",
      "B. 交换排序",
      "C. 选择排序",
      "D. 归并排序"
    ],
    "correct_answer": 3,
    "explanation": "这是归并排序（尤其是二路归并）的定义。它通过合并两个或多个有序子序列来构成一个更大的有序序列。",
    "question_number": 7
  },
  {
    "id": "mc_sort_exchange_definition",
    "filename": "1781690116275.jpg",
    "chapter": "第8章 排序",
    "type": "choice",
    "question": "当两个元素出现逆序的时候就交换位置，这种排序方法称为（）。",
    "options": [
      "A. 插入排序",
      "B. 交换排序",
      "C. 选择排序",
      "D. 归并排序"
    ],
    "correct_answer": 1,
    "explanation": "这是交换排序（如冒泡排序、快速排序）的基本思想，即通过不断交换处于逆序的元素对来实现排序。",
    "question_number": 8
  },
  {
    "id": "q1",
    "filename": "1781690116143.jpg",
    "chapter": "第8章 排序",
    "type": "calculation",
    "question": "设待排序关键字序列为：｛25，8,37，12,19,42,5，30,16,10｝。采用希尔排序，增量序列：d=5，3,1。要求：写出每一趟增量排序结束后的关键字序列状态。",
    "answer": "第一趟 (d=5): {25, 5, 30, 12, 10, 42, 8, 37, 16, 19}\n第二趟 (d=3): {12, 5, 10, 25, 8, 19, 42, 30, 37, 16}\n第三趟 (d=1): {5, 8, 10, 12, 16, 19, 25, 30, 37, 42}",
    "explanation": "希尔排序过程：\n1. 第一趟 d=5，划分为5组：{25, 42}, {8, 5}, {37, 30}, {12, 16}, {19, 10}。组内排序后合并得到：{25, 5, 30, 12, 10, 42, 8, 37, 16, 19}。\n2. 第二趟 d=3，划分为3组：{25, 12, 8, 19}, {5, 10, 37}, {30, 42, 16}。组内排序后合并得到：{12, 5, 10, 25, 8, 19, 42, 30, 37, 16}。\n3. 第三趟 d=1，直接插入排序得到最终有序序列：{5, 8, 10, 12, 16, 19, 25, 30, 37, 42}。"
  },
  {
    "id": "q2",
    "filename": "1781690116166.jpg",
    "chapter": "第8章 排序",
    "type": "calculation",
    "question": "设待排序关键字序列为：｛18,6，25,10,30,12,20, 8,16,28｝，采用快速排序（以当前子序列第一个元素为枢轴Pivot）。要求：写出每一趟划分（Partition）结束后的关键字序列状态。",
    "answer": "第一趟划分: {16, 6, 8, 10, 12, 18, 20, 30, 25, 28}\n第二趟划分: {12, 6, 8, 10, 16, 18, 20, 30, 25, 28} (对左子序列) & {12, 6, 8, 10, 16, 18, 20, 28, 25, 30} (对右子序列)",
    "explanation": "快速排序第一趟划分以18为枢轴：\n- 从右往左找小于18的数，找到16，放入首位；从左往右找大于18的数，找到25，放入刚才的空位...\n- 经过交换，18最终定位于索引5，左边均小于18，右边均大于18。划分结果为：{16, 6, 8, 10, 12, 18, 20, 30, 25, 28}。"
  },
  {
    "id": "q6",
    "filename": "1781690116232.jpg",
    "chapter": "第8章 排序",
    "type": "calculation",
    "question": "请对序列 {42, 18, 75, 29, 42*, 63, 11, 36, 50, 22} 进行希尔排序。（增量序列取 d=5, 3, 1）",
    "answer": "第一趟 (d=5): {42, 11, 36, 29, 22, 63, 18, 75, 50, 42*}\n第二趟 (d=3): {29, 11, 22, 42, 18, 36, 50, 42*, 75, 63}\n第三趟 (d=1): {11, 18, 22, 29, 36, 42, 42*, 50, 63, 75}",
    "explanation": "希尔排序：\n- 第一趟 d=5：子序列为 {42, 63}, {18, 11}, {75, 36}, {29, 50}, {42*, 22}。排序后得到：{42, 11, 36, 29, 22, 63, 18, 75, 50, 42*}。\n- 第二趟 d=3：子序列为 {42, 29, 18, 42*}, {11, 22, 75}, {36, 63, 50}。排序后得到：{29, 11, 22, 42, 18, 36, 50, 42*, 75, 63}。\n- 第三趟 d=1：直接插入排序，得到最终有序序列 {11, 18, 22, 29, 36, 42, 42*, 50, 63, 75}。"
  },
  {
    "id": "q8",
    "filename": "1781690116251.jpg",
    "chapter": "第8章 排序",
    "type": "calculation",
    "question": "给出关键字序列｛50，26, 38, 80, 70, 90, 8, 30, 40, 20｝的希尔排序过程（取增量序列为 d=5, 3, 1，排序结果从小到大排列）。",
    "answer": "第一趟 (d=5): {50, 8, 30, 40, 20, 90, 26, 38, 80, 70}\n第二趟 (d=3): {40, 8, 26, 50, 20, 30, 80, 70, 38, 90}\n第三趟 (d=1): {8, 20, 26, 30, 38, 40, 50, 70, 80, 90}",
    "explanation": "希尔排序过程：\n1. 第一趟 d=5：划分为 {50, 90}, {26, 8}, {38, 30}, {80, 40}, {70, 20}。组内排序后合并为 {50, 8, 30, 40, 20, 90, 26, 38, 80, 70}。\n2. 第二趟 d=3：划分为 {50, 40, 26, 70}, {8, 20, 38}, {30, 90, 80}。组内排序后合并为 {40, 8, 26, 50, 20, 30, 80, 70, 38, 90}。\n3. 第三趟 d=1：直接插入排序得到有序序列。"
  },
  {
    "id": "q9",
    "filename": "1781690116257.jpg",
    "chapter": "第8章 排序",
    "type": "calculation",
    "question": "给出关键字序列｛4, 5, 1, 2, 6, 3｝的直接插入排序过程。",
    "answer": "初始状态: {4, 5, 1, 2, 6, 3}\n第1步 (插入5): {4, 5, 1, 2, 6, 3}\n第2步 (插入1): {1, 4, 5, 2, 6, 3}\n第3步 (插入2): {1, 2, 4, 5, 6, 3}\n第4步 (插入6): {1, 2, 4, 5, 6, 3}\n第5步 (插入3): {1, 2, 3, 4, 5, 6}",
    "explanation": "直接插入排序过程：每一趟将一个待排序的记录按其关键字的大小插入到前面已经排好序的子序列中的适当位置，直到全部记录插入完毕为止。"
  }
];
