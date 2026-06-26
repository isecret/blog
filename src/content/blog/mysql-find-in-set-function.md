---
title: "MySQL 逗号分隔字符串列表字段查询"
excerpt: "最近写需求，同步了上游系统一个接口的数据到表里，大概长这样： 需求是查询 role id 为 5 的所有用户，最开始的想法是这样： 但是发现 最开始和最末尾的 ID 没有 , 分隔符 ，这就会导致最打头和最末尾的 ID 查不到。然后我又改成"
publishDate: 2020-08-13T01:53:00.000Z
updatedDate: 2020-12-22T01:56:59.000Z
isFeatured: false
tags: ["成长笔记", "MySQL"]
seo: 
  description: "最近写需求，同步了上游系统一个接口的数据到表里，大概长这样： 需求是查询 role id 为 5 的所有用户，最开始的想法是这样： 但是发现 最开始和最末尾的 ID 没有 , 分隔符 ，这就会导致最打头和最末尾的 ID 查不到。然后我又改成"
  pageType: article
---
最近写需求，同步了上游系统一个接口的数据到表里，大概长这样：

```text
| id | name | role_id |
| 1 | 小王 | 4,5,6 |
| 2 | 小张 | 5,6,7 |
| 3 | 小李 | 50,51,52 |
```

需求是查询 `role_id` 为 `5` 的所有用户，最开始的想法是这样：

```sql
select * from T where role_id like '%,5,%';
```

但是发现 **最开始和最末尾的 ID 没有 `,` 分隔符** ，这就会导致最打头和最末尾的 ID 查不到。然后我又改成了这样：

```sql
select * from T where role_id like '%5%';
```

这个结果显然会将 `id` 为 `3` 的结果一起查出来，况且 like 会扫描全表，这并不是我想要的。

后来我又想到了两个方案：

1. 新建一张表，字段有 `id` 和 `role_id`，将字符串 `role_id` 列表分隔成一条条关联数据；
2. 修改 `role_id` 格式为 `|id1|id2|id3|`，这样就可以用 `like '%|id1|%'` 查询。

直到 leader 在群里发了一个 `MySQL` 函数 `FIND_IN_SET`，让我立马拍大腿。

```text
FIND_IN_SET(needle,haystack);
needle是要查找的字符串，如果 needle 中包含逗号（,）将无法正常工作。
haystack是要搜索的逗号（,）分隔的字符串列表。
```

上述的 `role_id` 字段也不用调整和处理，修改查询语句如下：

```sql
select * from T where FIND_IN_SET(5, role_id);
```



参考：

- [MySQL find_in_set() 函数](https://www.yiibai.com/mysql/find_in_set.html)
