$(function () {
  // 从layui中获取layer对象
  const layer = layui.layer
  const form = layui.form
  var laypage = layui.laypage

  // 定义补零的函数
  function padZero(n) {
    return n > 9 ? n : '0' + n
  }
  // 定义美化时间的过滤器
  template.defaults.imports.dataFormat = function (date) {
    const dt = new Date(date)

    var y = dt.getFullYear()
    var m = padZero(dt.getMonth() + 1)
    var d = padZero(dt.getDate())

    var hh = padZero(dt.getHours())
    var mm = padZero(dt.getMinutes())
    var ss = padZero(dt.getSeconds())

    return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss
  }

  // 定义一个查询的参数对象，将来请求数据的时候，
  // 需要将请求参数对象提交到服务器
  var queryStr = {
    pagenum: 1, // 页码值，默认请求第一页的数据
    pagesize: 2, // 每页显示几条数据，默认每页显示2条
    cate_id: '', // 文章分类的 Id
    state: '' // 文章的发布状态
  }

  initTable()
  initCate()

  // 获取文章列表数据的方法
  function initTable() {
    // console.log(queryStr)
    $.ajax({
      method: 'GET',
      url: '/my/article/list',
      data: queryStr,
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg('获取文章列表失败！')
        }
        // 将数据渲染为字符串htmlStr
        var htmlStr = template('tpl-table', res)
        $('tbody').html(htmlStr)
        // console.log(res)
        // 调用渲染分页的方法  res.totalValue：文章总条数
        renderPage(res.totalValue)
      }
    })
  }

  // 初始化文章分类的方法
  function initCate() {
    $.ajax({
      method: 'GET',
      url: '/my/article/cates',
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg('获取分类数据失败！')
        }
        // 调用模板引擎渲染分类的可选项
        var htmlStr = template('tpl-cate', res)
        // 将渲染好的字符串htmlStr填充给下拉列表
        $('[name=cate_id]').html(htmlStr)
        // 通过 layui 重新渲染表单区域的UI结构
        form.render()
      }
    })
  }

  // 为筛选表单绑定 submit 事件
  $('#form-search').on('submit', function (e) {
    e.preventDefault()
    // 获取表单中选中项的值W
    var cate_id = $('[name=cate_id]').val()
    var state = $('[name=state]').val()
    // 为查询参数对象 queryStr 中对应的属性赋值
    queryStr.cate_id = cate_id
    queryStr.state = state
    // console.log(queryStr)
    // 根据最新的筛选条件，重新渲染表格的数据    
    initTable()
  })

  // 定义渲染分页的方法
  function renderPage(total) {
    // 调用 laypage.render() 方法来渲染分页的结构
    laypage.render({
      elem: 'pageBox', // 分页容器的 Id
      count: total, // 总数据条数
      limit: queryStr.pagesize, // 每页显示几条数据
      curr: queryStr.pagenum, // 设置默认被选中的分页
      layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
      limits: [2, 3, 5, 10],
      // 分页发生切换的时候，触发 jump 回调
      // 触发 jump 回调的方式有两种：
      // 1. 点击页码的时候，会触发 jump 回调
      // 2. 只要调用了 laypage.render() 方法，就会触发 jump 回调
      jump: function (obj, first) {
        // 可以通过 first 的值，来判断是通过哪种方式 触发的 jump 回调
        // 如果 first 的值为 true，证明是方式2触发的，否则就是方式1触发的
        // console.log(first)
        // 点击页码产生的最新的页码值
        // console.log(obj.curr)
        // 把最新的页码值，赋值到 queryStr 这个查询参数对象中
        queryStr.pagenum = obj.curr
        // 切换条目时也会触发jump回调，在jump回调中通过obj.limit可获取最新条目数
        // 把最新的条目数，赋值到 queryStr 这个查询参数对象的 pagesize 属性中
        queryStr.pagesize = obj.limit
        // 根据最新的 queryStr 获取对应的数据列表，并渲染表格
        if (!first) {
          initTable()
        }
      }
    })
  }

  // 通过 代理 的形式，为 动态渲染的tbody中的 btn-delete删除按钮 绑定点击事件处理函数  
  $('tbody').on('click', '.btn-delete', function () {
    // 获取删除按钮的个数
    var len = $('.btn-delete').length
    var id = $(this).attr('data-id')
    // console.log(id)
    // 提示用户是否删除
    layer.confirm('确定删除?', { icon: 3, title: '提示' }, function (index) {
      // 根据 id 的值发起请求删除对应分类的数据
      $.ajax({
        method: 'GET',
        url: '/my/article/deletearticle/' + id,
        success: function (res) {
          if (res.status !== 0) {
            // console.log(res)
            return layer.msg('删除文章失败！')
          }
          layer.msg('删除文章成功！')
          // 当数据删除完成后，需要判断当前这一页中，是否还有剩余的数据
          // 如果没有剩余的数据了，则让页码值 -1 之后，再重新调用 initTable 方法
          if (len === 1) {
            // 如果 len 的值等于1，证明删除完毕之后，页面上就没有任何数据了
            // 页码值pagenum 最小必须是 1
            queryStr.pagenum = queryStr.pagenum === 1 ? 1 : queryStr.pagenum - 1
          }
          initTable()
          // 关闭 confirm 询问框（关闭层）
          layer.close(index)
        }
      })
    })
  })

  // 通过 代理 的形式，为 动态渲染的tbody中的 btn-edit编辑按钮 绑定点击事件处理函数  
  $('tbody').on('click', '.btn-edit', function () {
    // 1. 根据 id 的值发起请求编辑对应的数据    
    var id = $(this).attr('data-id')
    // 2. 强制跳转到登录页面
    location.href = '/article/art_pub.html?' + encodeURIComponent(id)
  })

})