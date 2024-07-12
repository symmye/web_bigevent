$(function () {
  // 从layui中获取layer对象
  const layer = layui.layer
  const form = layui.form

  initArtCateList()

  // 获取文章分类的列表
  function initArtCateList() {
    $.ajax({
      method: 'GET',
      url: '/my/article/cates',
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg('获取文章分类列表失败！')
        }
        // console.log(res)
        // 将数据渲染为字符串htmlStr
        var htmlStr = template('tpl-table', res)
        $('tbody').html(htmlStr)
      }
    })
  }

  // 定义 添加文章分类弹出层 索引
  var indexAdd = null
  // 为添加类别按钮绑定点击事件
  $('#btnAddCate').on('click', function () {
    // 打开弹出层
    indexAdd = layer.open({
      type: 1,
      area: ['500px', '250px'],
      title: '添加文章分类',
      content: $('#dialog-add').html()
    })
  })

  // 通过代理的形式，为 弹出层中的 form-add 表单绑定 submit 事件
  $('body').on('submit', '#form-add', function (e) {
    e.preventDefault()
    $.ajax({
      method: 'POST',
      url: '/my/article/addcates',
      data: $(this).serialize(),
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg('新增分类失败！')
        }
        initArtCateList()
        layer.msg('新增分类成功！')
        // 根据索引，关闭对应的弹出层
        layer.close(indexAdd)
      }
    })
  })

  // 定义 修改文章分类弹出层 索引
  var indexEdit = null
  // 通过 代理 的形式，为 动态渲染的tbody中的 btn-edit 按钮绑定点击事件  
  $('tbody').on('click', '.btn-edit', function () {
    // 弹出一个修改文章分类信息的层
    indexEdit = layer.open({
      type: 1,
      area: ['500px', '250px'],
      title: '修改文章分类',
      content: $('#dialog-edit').html()
    })
    var id = $(this).attr('data-id')
    // console.log(id)
    // 根据 id 的值发起请求获取对应分类的数据
    $.ajax({
      method: 'GET',
      url: '/my/article/cates/' + id,
      success: function (res) {
        // 调用form.val()快速为表单赋值（前提：需为表单添加lay-filter属性）
        form.val('form-edit', res.data)
      }
    })
  })

  // 通过代理的形式，为 弹出层中的 form-edit 表单绑定 submit 事件
  $('body').on('submit', '#form-edit', function (e) {
    e.preventDefault()
    $.ajax({
      method: 'POST',
      url: '/my/article/updatecate',
      data: $(this).serialize(),
      success: function (res) {
        if (res.status !== 0) {
          // console.log(res)
          return layer.msg('修改分类失败！')
        }
        initArtCateList()
        layer.msg('修改分类成功！')
        // 根据索引，关闭对应的弹出层
        layer.close(indexEdit)
      }
    })
  })

  // 通过 代理 的形式，为 动态渲染的tbody中的 btn-delete删除按钮 绑定点击事件  
  $('tbody').on('click', '.btn-delete', function () {
    var id = $(this).attr('data-id')
    // 提示用户是否删除
    layer.confirm('确定删除?', { icon: 3, title: '提示' }, function (index) {
      // 根据 id 的值发起请求删除对应分类的数据
      $.ajax({
        method: 'GET',
        url: '/my/article/deletecate/' + id,
        success: function (res) {
          if (res.status !== 0) {
            // console.log(res)
            return layer.msg('删除文章分类失败！')
          }
          initArtCateList()
          layer.msg('删除文章分类成功！')
          // 关闭 confirm 询问框（关闭层）
          layer.close(index)
        }
      })

    })

  })


})