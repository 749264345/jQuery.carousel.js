;(function ($, window, undefined) {
    "use strict";

    var Carousel = function (ele, opts) {
            this.$ele = ele,
            this.defaults = {
                //自定义宽高，参数Array;
                //全屏展示，可选参数 'fullScreen'
                size: [940, 400],

                //轮播方向，可选参数 'x','y'
                direction: 'x',

                //默认展示的轮播索引
                index: 0,

                //容器中内容是否垂直居中
                horVertical: true, 

                //导航箭头选项
                arrow: {
                    //是否显示箭头
                    show: false,
                    //左右箭头显示的内容
                    html: ["<i class='icon-arrow-left'></i>", "<i class='icon-arrow-right'></i>"]
                },

                //导航焦点选项
                trigger: {
                    //是否显示焦点
                    show: false,
                    //焦点位置 可选参数 'top','bottom','left','right'
                    position: 'bottom',
                    //焦点展示类型 可选参数 'dots','title'
                    type: 'dots', 
                    //焦点类型为'title'时，以文字内容展示焦点
                    title: ['Pic One', 'Pic Two', 'Pic Three']
                },

                //是否自动轮播
                autoPlay: false,

                //轮播间隔，单位毫秒
                interval: 3000,

                //轮播速度，单位毫秒
                speed: 500,

                //轮播离开时执行的回调函数，接收参数index为当前索引
                onLeave: function (index) {},

                //轮播进入时执行的回调函数，接收参数index为当前索引
                onEnter: function (index) {}
            },
            this.opts = $.extend({}, this.defaults, opts),
            this.prev = 0,
            this.next = 0,
            this.prevIndex = 0,
            this.pos = {},
            this.$width = (this.opts.size === 'fullScreen') ? $(window).width() : this.opts.size[0],
            this.$height = (this.opts.size === 'fullScreen') ? $(window).height() : this.opts.size[1],
            this.$container = $(this.$ele),
            this.$item = this.$container.find('.carousel-item');

            this.opts.arrow = $.extend({}, this.defaults.arrow, this.opts.arrow);
            this.opts.trigger = $.extend({}, this.defaults.trigger, this.opts.trigger);
            this.opts.index = (this.opts.index >= this.$item.length || this.opts.index < 0) ? 0 : this.opts.index;
    }

    Carousel.prototype = {
        render() {
            var init = {
                width: this.$width,
                height: this.$height
            };
            this.$container.css(init);
            this.$item.css(init);
            this.direction();
            this.$item.eq(this.opts.index).css(this.pos.init).siblings().css(this.pos.minus);
        },
        resize() {
            var that = this;
            $(window).resize(function () {
                that.$width = $(this).width(), that.$height = $(this).height();
                that.render()
            });
        },
        display() {
            this.$item.wrapAll('<div class="carousel-wrap"></div>');
            if (this.opts.horVertical === true) {
                this.$item.each(function () {
                    $(this).wrapInner('<div class="table"><div class="table-cell"></div></div>');
                });
            };

            if (this.opts.arrow.show === true) {
                this.$container.append('<span class="carousel-arrow carousel-arrow-left">' + this.opts.arrow.html[0] + '</span><span class="carousel-arrow carousel-arrow-right">' + this.opts.arrow.html[1] + '</span>');
            }

            if (this.opts.trigger.show === true) {
                this.$container.append('<div class="carousel-trigger"></div>');
                var $trigger = this.$container.find('.carousel-trigger');
                $trigger.addClass(this.opts.trigger.position + ' ' + this.opts.trigger.type);
                if (this.opts.trigger.type === 'title') {
                    for (var i = 0; i < this.$item.length; i++) {
                        $trigger.append('<i class="trigger" title="' + this.opts.trigger.title[i] + '">' + this.opts.trigger.title[i] + '</i>');
                    }
                } else {
                    for (var i = 0; i < this.$item.length; i++) {
                        $trigger.append('<i class="trigger"></i>');
                    }
                }
                $trigger.find('.trigger').eq(this.opts.index).addClass('current');
            };

            this.render();
        },
        direction() {
            if (this.opts.direction === 'x') {
                this.pos = {
                    init: {
                        left: 0
                    },
                    add: {
                        left: this.$width
                    },
                    minus: {
                        left: -this.$width
                    }
                };
            } else {
                this.pos = {
                    init: {
                        top: 0
                    },
                    add: {
                        top: this.$height
                    },
                    minus: {
                        top: -this.$height
                    }
                };
            }
        },
        moveMinus() {
            var that = this;
            this.$item.eq(this.prevIndex).stop(false, true).animate(this.pos.add, this.opts.speed);
            this.$item.eq(this.opts.index).css(this.pos.minus).stop(false, true).animate(this.pos.init, this.opts.speed, function () {
                that.callBack();
            });
            this.current(this.opts.index);
        },
        moveAdd() {
            var that = this;
            this.$item.eq(this.prevIndex).stop(false, true).animate(this.pos.minus, this.opts.speed).siblings().css(this.pos.minus);
            this.$item.eq(this.opts.index).css(this.pos.add).stop(false, true).animate(this.pos.init, this.opts.speed, function () {
                that.callBack();
            });
            this.current(this.opts.index);
        },
        current(index) {
            this.$container.find('.trigger').eq(this.opts.index).addClass('current').siblings().removeClass('current');
        },
        autoPlay() {
            var that = this;
            function auto() {
                that.prevIndex = that.opts.index;
                that.opts.index >= that.$item.length - 1 ? that.opts.index = 0 : that.opts.index++;
                that.moveAdd();
            }
            var timer = setInterval(auto, this.opts.interval);
            this.$container.hover(function () {
                clearInterval(timer);
            }, function () {
                timer = setInterval(auto, that.opts.interval);
            });
        },
        callBack() {
            if (this.opts.onLeave) {
                this.opts.onLeave(this.prevIndex);
            }
            if (this.opts.onEnter) {
                this.opts.onEnter(this.opts.index);
            }
        },
        init() {
            var that = this;
             this.$container.on('mouseover', '.trigger', function (e) {
                 e.preventDefault();
                 that.prevIndex = that.opts.index;
                 that.opts.index = $(this).index();
                 if (that.opts.index > that.prevIndex) {
                     that.moveAdd();
                 } else if (that.opts.index < that.prevIndex) {
                     that.moveMinus();
                 }
             });
             this.$container.on('click', '.carousel-arrow-left', function (e) {
                 e.stopPropagation();
                 if (!that.$item.is(":animated")) {
                    that.prevIndex =  that.opts.index;
                    that.opts.index > 0 ?  that.opts.index-- :  that.opts.index = that.$item.length - 1;
                    that.moveMinus();
                 }
             });
             this.$container.on('click', '.carousel-arrow-right', function (e) {
                 e.stopPropagation();
                 if (!that.$item.is(":animated")) {
                      that.prevIndex =  that.opts.index;
                      that.opts.index >= that.$item.length - 1 ?  that.opts.index = 0 :  that.opts.index++;
                      that.moveAdd();
                 }
             });

             this.display();
             if (this.opts.autoPlay) {
                 this.autoPlay();
             }
             if (this.opts.size === 'fullScreen') {
                 this.resize();
             }
        }
    }

    $.fn.carousel = function (options) {
        var fn = new Carousel(this, options);
        return fn.init();
    }

})(jQuery, window);