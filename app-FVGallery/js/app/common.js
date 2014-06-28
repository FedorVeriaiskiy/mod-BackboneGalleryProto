define(['underscore', 'backbone', 'vendor/modernizr'], function ( underscore, backbone, modernizr) {

//Main application code

    // CONTROLLER
    var Controller = Backbone.Router.extend({
        routes: {
            "": "start",
            "!/": "start"
        },

        start: function () {
        }
    });
    var controller = new Controller();


// MODEL (thumb)
    var Thumb = Backbone.Model.extend({
        defaults: {
            title: 'random title',
            thumbUrl: '',
            fullUrl: ''
        }
    });
    var thumb = new Thumb();


// COLLECTION (Thumbs)
    var Thumbs = Backbone.Collection.extend({
            model: Thumb
        }),
        thumbs;


// VIEWS (ThumbView, ThumbnailsView, ImageFullSize)
    var ThumbView = Backbone.View.extend({
        tagName: 'li',
        className: 'image-thumbnail',
        template: _.template($('#galery-thumbnail-template').html()),

        events: {
        },

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    var ThumbnailsView = Backbone.View.extend({
        tagName: 'ul',
        curImageModel: {},
        self: this,

        events: {
            'click img': "showFullsizeImage"
        },

        render: function () {
            this.collection.each(function (person) {
                var curFrontView = new ThumbView({model: person});
                this.$el.append(curFrontView.render().el);
            }, this);
            return this;
        },

        showFullsizeImage: function (ev) {
            var curImageThumbUrl = $(ev.target).attr('src');
            self.curImageModel = thumbs.findWhere({'thumbUrl': curImageThumbUrl});
            thumbFullSize.render(self.curImageModel.get('fullUrl'));
            return false;
        }
    });

    var ImageFullSize = Backbone.View.extend({
        el: $("#gallery-fullsize-outer-block"),
        template: _.template($('#gallery-fullSize-template').html()),
        self: this,

        events: {
            'click #btn-back': 'showPrevFullSizeImage',
            'click #btn-forward': 'showNextFullSizeImage',
            'click #btn-close': 'closeFullSizeImage'
        },

        initialize: function () {
            $(document).on('keydown', this.keyPressHandler);
        },

        render: function (fullSizeImageUrl) {
            this.$el.html(this.template({'fullUrl': fullSizeImageUrl}));
            $('#gallery-fullsize-outer-block').fadeIn(100);
            return this;
        },

        showPrevFullSizeImage: function () {
            var nextImageModel;
            nextImageModel = thumbs.at(thumbs.indexOf(self.curImageModel) - 1);
            if (!nextImageModel) {
                nextImageModel = thumbs.at(thumbs.length - 1);
            }
            self.curImageModel = nextImageModel;
            this.$el.html(this.template({'fullUrl': nextImageModel.get('fullUrl')}));
        },

        showNextFullSizeImage: function () {
            var nextImageModel = thumbs.at(thumbs.indexOf(self.curImageModel) + 1);
            if (!nextImageModel) {
                nextImageModel = thumbs.at(0);
            }
            self.curImageModel = nextImageModel;
            this.$el.html(this.template({'fullUrl': nextImageModel.get('fullUrl')}));
        },

        closeFullSizeImage: function () {
            $('#gallery-fullsize-outer-block').fadeOut(100);
            $('#gallery-fullsize-image').attr('src', '');
        },

        keyPressHandler: function (e) {
            // check if was pushed button "Esc"
            switch (e.which) {
                // esc
                case 27:
                    $('#gallery-fullsize-outer-block').fadeOut(100);
                    $('#gallery-fullsize-image').attr('src', '');
                    break;
            }
        }
    });

    var thumbFullSize = new ImageFullSize();

//    Load models to collection from JSON file via ajax
    $.ajax({
        dataType: "json",
        url: "js/app/gallery-images.json",
        async: false,
        success: function (thumbsCollection) {
            thumbs = new Thumbs(thumbsCollection);

            var thumbnailsViews = new ThumbnailsView({collection: thumbs});
            $('#gallery-thumbs').append(thumbnailsViews.render().el);
        }
    });
    Backbone.history.start();
});