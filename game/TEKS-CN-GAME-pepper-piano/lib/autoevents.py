import functools
import traceback

import naoqi

def on(listenedEventName): #  A decorator for magically adding callbacks
    def decorator(func):
        @functools.wraps(func)
        def customCallback(self, eventName, param):
            try:
                func(self, param)
            except Exception as e: # Because errors in callbacks don't work
                self.logger.error(traceback.format_exc())
        customCallback._listenedEventName = listenedEventName
        return customCallback
    return decorator

def subscribe(box):
    #box.log("[jdb] subscribing for box: " + repr(box))
    memory = naoqi.ALProxy("ALMemory")
    for funcName in dir(box):
        func = getattr(box, funcName)
        if callable(func) and hasattr(func, "_listenedEventName"):
            memory.subscribeToEvent(func._listenedEventName , box.getName(), "", funcName)
            #box.log("[jdb] subscribed " + funcName)
        #elif callable(func):
        #    box.log("[jdb] callable but: " + funcName)
    #box.log("[jdb] done subscribing for box: " + repr(box))


def unsubscribe(box):
    memory = naoqi.ALProxy("ALMemory")
    for funcName in dir(box):
        func = getattr(box, funcName)
        if callable(func) and hasattr(func, "_listenedEventName"):
            try:
                memory.unsubscribeToMicroEvent(func._listenedEventName , box.getName())
            except Exception as e:
                box.log("Exception in unsubscribe: " + str(e))
