t.a = {
      required: {
        validator: function (e) {
          return null != e && ("boolean" == typeof e ? e : String(e).trim().length > 0);
        },
        message: "This field is required."
      },
      length: {
        validator: function (e, t) {
          var n = e ? String(e).trim().length : 0;
          return n >= t[0] && n <= t[1];
        },
        message: "Please enter a value between {0} and {1}."
      },
      email: {
        validator: function (e) {
          return /^[a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,15})$/.test(e);
        },
        message: "Please enter a valid email address."
      },
      url: {
        validator: function (e) {
          return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[\/?#]\S*)?$/i.test(e);
        },
        message: "Please enter a valid URL."
      }
    };