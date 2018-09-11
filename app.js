(function () {
    var Message, ApiEndpoint, ConversationContext;
	
	ApiEndpoint = "https://assistant-service.herokuapp.com/api/v1/Assistant";
	ConversationContext = {};
	
    Message = function (arg) {
        this.text = arg.text;
		this.message_side = arg.message_side;
		
        this.draw = function (_this) {
            return function () {
                var $message;
                $message = $($('.message_template').clone().html());
                $message.addClass(_this.message_side).find('.text').html(_this.text);
                $('.messages').append($message);
                return setTimeout(function () {
                    return $message.addClass('appeared');
                }, 0);
            };
        }(this);
        return this;
    };
	
    $(function () {
        var getInputMessageText, message_side, displayMessage, sendMessageRequest;
        
		message_side = 'left';
		
        getInputMessageText = function () {
            var $message_input;
            $message_input = $('.message_input');
            return $message_input.val();
        };
		
        displayMessage = function (text, isUser = false) {
            var $messages, message;
            if (text.trim() === '') {
                return;
            }
            $('.message_input').val('');
            $messages = $('.messages');
            message_side = isUser ? 'right' : 'left';
            message = new Message({
                text: text,
                message_side: message_side
            });
            message.draw();
            return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
        };
		
		// Send a message request to the server
		sendMessageRequest = function (text) {
            // Build request payload
			var payloadToWatson = {
				context: ConversationContext
			};
			if (text) {
			  payloadToWatson.input = {
				text: text				
			  };
			}
			
			$.ajax({
				type: "POST",
				url: ApiEndpoint,
				data: JSON.stringify(payloadToWatson),
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				success: function( data, textStatus, jQxhr ){
					if (!data.output)
					{
						console.log( data );
						return displayMessage("I'm sorry, nothing in response form server!");
					}else{
						// For debug tracking
						console.log( data );
						if(data.context)
						{
							ConversationContext = data.context;
						}						
						return displayMessage(data.output.text[0]);
					}					
				},
				error: function( jqXhr, textStatus, errorThrown ){
					console.log( errorThrown );
					return displayMessage("I'm sorry, the server cannot response for now!");
				}
			});
        };
		
        $('.send_message').click(function (e) {
			var message = getInputMessageText();
			if (message.trim() === '') {
                return;
            }
            displayMessage(message, true);
			return sendMessageRequest(message);
        });
		
        $('.message_input').keyup(function (e) {
            if (e.which === 13) {
                var message = getInputMessageText();
				if (message.trim() === '') {
					return;
				}
				displayMessage(message, true);
				return sendMessageRequest(message);
            }
        });
		
		sendMessageRequest("");
    });
}.call(this));