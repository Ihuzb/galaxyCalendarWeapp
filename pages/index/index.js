// index.js
// 获取应用实例
const app = getApp()
const chooseLocation = requirePlugin('chooseLocation');
const QQMapWX = require('./qqmap-wx-jssdk.min');
import galaxyTime from 'galaxy-time'
let {
  formattingTime,
  formattingMoonPhase,
  formattingGalaxyAzimuth
} = require('../../public/index')
// 实例化API核心类
const qqmapsdk = new QQMapWX({
  key: '3NDBZ-4JWKO-KKGWF-SJKGH-IA4LV-TOB73' // 必填
});
Page({
  data: {
    motto: 'Hello World',
    newDate: new Date(),
    moonPhase: '🌕',
    direction: '', // 方向
    userInfo: {},
    location: {},
    galaxyInfo: {},
    activeNames: ['1'],
    maxDate: new Date(2023, 0, 31).getTime(),
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'), // 如需尝试获取用户信息可改为false
  },
  onChange(event) {
    this.setData({
      activeNames: event.detail,
    });
  },
  onConfirm(event) {
    let {
      latitude,
      longitude
    } = this.data.location;
    this.galaxy_time(event.detail, latitude, longitude);
    this.setData({
      newDate: event.detail
    })
  },
  setFormatterInfo({
    latitude = '',
    longitude = ''
  }) {
    const _this = this;
    _this.setData({
      formatterInfo: function (day) {
        let times = formattingTime(day.date);
        let info = galaxyTime.getTrueGalaxyTimes(times, latitude, longitude);
        if (info.code == 1) {
          let hours = Number(info.hours);
          day.bottomInfo = hours <= 2 ? '⭐️' : hours <= 4 ? '⭐️⭐️' : '⭐️⭐⭐️'
        }
        // day.bottomInfo = '⭐️🪐🌌🪰⭐️🌟🌌💫🌕🌖🌗🌘🌑🌒🌓🌔';
        return day;
      }
    })
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  startLocation() {
    let _this = this;
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        let {
          latitude,
          longitude
        } = res;
        _this.galaxy_time(new Date(), latitude, longitude)
        // 设置日历自定义文案
        _this.setFormatterInfo({
          latitude,
          longitude
        });
        let location = {
          latitude,
          longitude
        };
        qqmapsdk.reverseGeocoder({
          location: {
            latitude,
            longitude
          },
          success: function (res) { //成功后的回调
            const data = res.result;
            let {
              formatted_addresses,
              address_component
            } = data;
            location["name"] = formatted_addresses.recommend;
            location["district"] = address_component.district;
            location["city"] = address_component.city;
            location["province"] = address_component.province;
            _this.setData({
              location,
            })
          }
        })
      }
    })
  },
  onLoad() {
    let _this = this;
    wx.authorize({
      scope: 'scope.userLocation',
      success() {
        _this.startLocation()
      }
    })
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },
  galaxy_time(date, lat, lon) {
    let galaxyInfo = this.data.galaxyInfo;
    let times = formattingTime(date);
    // 银河方位角数据
    let GalaxyPosition = galaxyTime.getGalaxyPosition(date, lat, lon);
    // 银河可见时间数据
    let TrueGalaxyTimes = galaxyTime.getTrueGalaxyTimes(times, lat, lon);
    // 月亮数据 月相
    let MoonPosition = galaxyTime.getMoonIllumination(date, lat, lon);
    // 月亮时间
    let MoonTimes = galaxyTime.getMoonTimes(date, lat, lon);
    // 日出日落
    let Times = galaxyTime.getTimes(date, lat, lon);
    let {
      phase
    } = MoonPosition;
    let {
      azimuth
    } = GalaxyPosition;
    galaxyInfo["GalaxyPosition"] = GalaxyPosition;
    galaxyInfo["TrueGalaxyTimes"] = TrueGalaxyTimes;
    galaxyInfo["MoonTimes"] = MoonTimes;
    galaxyInfo["Times"] = Times;
    this.setData({
      galaxyInfo,
      moonPhase: formattingMoonPhase(phase),
      direction: formattingGalaxyAzimuth(azimuth, TrueGalaxyTimes.code)
    })
    console.log(galaxyInfo);
  },
  onShow() {
    let _this = this;
    const location = chooseLocation.getLocation(); // 如果点击确认选点按钮，则返回选点结果对象，否则返回null
    if (location) {
      let {
        latitude,
        longitude
      } = location;
      _this.galaxy_time(_this.data.newDate, latitude, longitude)
      // 设置日历自定义文案
      _this.setFormatterInfo({
        latitude,
        longitude
      });
      this.setData({
        location
      })
    }

  },
  onUnload() {
    // 页面卸载时设置插件选点数据为null，防止再次进入页面，geLocation返回的是上次选点结果
    chooseLocation.setLocation(null);
  },
  showMap() {
    const key = '3NDBZ-4JWKO-KKGWF-SJKGH-IA4LV-TOB73'; //使用在腾讯位置服务申请的key
    const referer = '逸生活YI'; //调用插件的app的名称
    const category = '生活服务,娱乐休闲';

    wx.navigateTo({
      url: `plugin://chooseLocation/index?key=${key}&referer=${referer}&category=${category}`
    });
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})