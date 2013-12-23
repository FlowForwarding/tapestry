//
//  NCIBtmChartView.m
//  NCIChart
//
//  Created by Ira on 12/22/13.
//  Copyright (c) 2013 FlowForwarding.Org. All rights reserved.
//

#import "NCIBtmChartView.h"
#import "NCIHandspikeView.h"
#import "NCISimpleGraphView.h"
#import "NCISimpleGridView.h"
#import "NCIChartView.h"
#import "NCITopChartView.h"

@interface NCIBtmChartView(){
    NCIHandspikeView *handspikeLeft;
    NCIHandspikeView *handspikeRight;
    UIView *rightAmputation;
    UIView *leftAmputation;
    
    float handspikeWidth;
    float minRangesDistance;
}

@property(nonatomic)float xHandspikeLeft;
@property(nonatomic)float xHandspikeRight;

@end

@implementation NCIBtmChartView

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        handspikeWidth = 2;
        minRangesDistance = 10;
    }
    return self;
}

- (void)addSubviews{
    [super addSubviews];
    handspikeLeft = [[NCIHandspikeView alloc] initWithFrame:CGRectZero];
    [self addSubview:handspikeLeft];
    handspikeRight = [[NCIHandspikeView alloc] initWithFrame:CGRectZero];
    [self addSubview:handspikeRight];
    rightAmputation = [[UIView alloc] initWithFrame:CGRectZero];
    rightAmputation.backgroundColor = [[UIColor greenColor] colorWithAlphaComponent:0.1];
    [self addSubview:rightAmputation];
    leftAmputation = [[UIView alloc] initWithFrame:CGRectZero];
    leftAmputation.backgroundColor = [[UIColor greenColor] colorWithAlphaComponent:0.1];
    [self addSubview:leftAmputation];
}

- (void)layoutSubviews{
    [super layoutSubviews];
    if (!_xHandspikeLeft)
        _xHandspikeLeft = self.graph.xLabelsWidth;
    if (!_xHandspikeRight)
        _xHandspikeRight = self.frame.size.width;
    handspikeLeft.frame = CGRectMake(_xHandspikeLeft, 0, handspikeWidth, self.graph.grid.frame.size.height);
    handspikeRight.frame = CGRectMake(_xHandspikeRight,
                                      0, handspikeWidth, self.graph.grid.frame.size.height);
    float gridHeigth =  self.graph.grid.frame.size.height;
    handspikeRight.frame = CGRectMake(_xHandspikeRight, 0, handspikeWidth, gridHeigth);
    rightAmputation.frame = CGRectMake(_xHandspikeRight, 0,
                                       self.frame.size.width - _xHandspikeRight, gridHeigth);
}

- (void)redrawRanges{

    float gridHeigth =  self.graph.grid.frame.size.height;
    _xHandspikeLeft = [self.graph getXValueByDate:self.nciChart.minRangeDate] + self.graph.xLabelsWidth;
    _xHandspikeRight = [self.graph getXValueByDate:self.nciChart.maxRangeDate] + self.graph.xLabelsWidth;
    
    handspikeLeft.frame = CGRectMake(_xHandspikeLeft, 0, handspikeWidth, gridHeigth);
    leftAmputation.frame = CGRectMake(self.graph.xLabelsWidth, 0, _xHandspikeLeft - self.graph.xLabelsWidth, gridHeigth);
    
    handspikeRight.frame = CGRectMake(_xHandspikeRight, 0, handspikeWidth, gridHeigth);
    rightAmputation.frame = CGRectMake(_xHandspikeRight, 0,
                                       self.frame.size.width - _xHandspikeRight, gridHeigth);

    
}

static float startLeft = -1;
static float startRight = -1;

-(void) touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event
{
    __block UITouch *touch1;
    __weak NCIBtmChartView *weakSelf = self;
    
    [[event allTouches] enumerateObjectsUsingBlock:^(UITouch  *touch, BOOL *stop) {
        CGPoint location = [touch locationInView:weakSelf];
        if ([event allTouches].count == 2 ){
            if (!touch1){
                touch1 = touch;
            } else {
                [weakSelf startMoveWithPoint:[touch1 locationInView:weakSelf] andPoint:location];
            }
        } else {
            if (location.x <= (_xHandspikeLeft + handspikeWidth)){
                startLeft = location.x - handspikeLeft.center.x;
            } else if (location.x >= _xHandspikeRight){
                startRight = location.x - handspikeRight.center.x;
            }
        }
    }];
}

- (void)startMoveWithPoint:(CGPoint) point1 andPoint:(CGPoint) point2{
    if(point1.x < point2.x){
        startLeft = point1.x - handspikeLeft.center.x;
        startRight = point2.x - handspikeRight.center.x;
    } else {
        startLeft = point2.x - handspikeLeft.center.x;
        startRight = point1.x - handspikeRight.center.x;
    }
}

- (void) touchesMoved:(NSSet *)touches withEvent:(UIEvent *)event{
    __block UITouch *touch1;
    
    __block float newLeft = -1;
    __block float newRight = -1;
    
    __weak NCIBtmChartView* weakSelf = self;
    //here we set up new min and max ranges values for chart
    [[event allTouches] enumerateObjectsUsingBlock:^(UITouch  *touch, BOOL *stop) {
        CGPoint location = [touch locationInView:weakSelf];
        if ([event allTouches].count == 2 ){
            if (!touch1){
                touch1 = touch;
            } else {
                NSArray *newXPos = [weakSelf detectNewXPosFrom:[touch1 locationInView:weakSelf] and:location];
                newLeft = [(NSNumber *)newXPos[0] doubleValue];
                newRight = [(NSNumber *)newXPos[1] doubleValue];
            }
            
        } else {
            if (location.x <= (_xHandspikeLeft + handspikeWidth)){
                newLeft = location.x - startLeft;
            } else if (location.x >= (_xHandspikeRight - minRangesDistance)){
                newRight = location.x - startRight;
            }
        };
        
    }];
    
    [self moveRangesFollowingNewLeft:newLeft newRight:newRight];
}

- (NSArray *)detectNewXPosFrom:(CGPoint)location1 and:(CGPoint) location2{
    if (location1.x < location2.x){
        return @[@(location1.x - startLeft), @(location2.x - startRight)];
    } else {
        return @[@(location2.x - startLeft), @(location1.x - startRight)];
    }
}

- (void)moveRangesFollowingNewLeft:(double)newLeft newRight:(double)newRight {
    if ((newLeft != -1 && newRight != -1) && (newRight - newLeft) < minRangesDistance)
        return;
    
    if (!( (newLeft != -1 ) && ((newLeft - self.graph.xLabelsWidth) > 0))){
        newLeft = _xHandspikeLeft;
    };
    
    if (!((newRight != -1) && (newRight < self.frame.size.width))){
        newRight = _xHandspikeRight;
    };
    
    self.nciChart.minRangeDate = [self.graph getDateByX:newLeft];
    self.nciChart.maxRangeDate = [self.graph getDateByX:newRight];

    [self.nciChart.topChart.graph setNeedsLayout];
    [self.nciChart.topChart.graph setNeedsDisplay];
    [self.nciChart.topChart layoutSelectedPoint];
    [self redrawRanges];
}

@end