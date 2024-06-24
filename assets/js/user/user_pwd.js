$(function () {
  // 从layui中获取form对象
  const form = layui.form
  const layer = layui.layer

  // 表单验证规则
  form.verify({
    pwd: [
      /^[\S]{6,12}$/
      , '密码必须6到12位，且不能出现空格'
    ],
    // 校验新密码与旧密码是否相同的规则
    samepwd: function (value) {
      // 通过形参拿到的是新密码框中的内容
      // 还需要拿到旧密码框中的内容
      // 然后进行一次等于的判断
      // 如果判断失败,则return一个提示消息即可
      var oldpwd = $('.layui-card-body [name=oldPwd]').val()
      if (oldpwd == value) {
        return '新旧密码不能相同！'
      }
    },
    // 校验确认密码与新密码是否一致的规则
    repwd: function (value) {
      // 通过形参拿到的是确认密码框中的内容
      // 还需要拿到新密码框中的内容
      // 然后进行一次等于的判断
      // 如果判断失败,则return一个提示消息即可
      var pwd = $('[name=newPwd]').val()
      if (pwd !== value) {
        return '两次密码不一致！'
      }
    }

  })

  // 监听表单的提交事件
  $('.layui-form').on('submit', function (e) {
    // 阻止表单的默认提交行为
    e.preventDefault()
    // 发起 ajax 数据请求
    $.ajax({
      method: 'POST',
      url: '/my/updatepwd',
      data: $(this).serialize(),
      success: function (res) {
        if (res.status !== 0) {
          // return layer.msg('修改密码失败！')
          return layer.msg(res.message)
        }
        layer.msg('修改密码成功！')
        // 重置表单 $('.layui-form')[0]获取jQuery对象的原生DOM对象
        $('.layui-form')[0].reset()
      }
    })
  })
})