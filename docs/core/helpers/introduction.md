## Helpers

Thư mục `helpers/` chứa các helper functions hỗ trợ các tác vụ phổ biến.

### Danh sách Helpers

| Tên                    | File                          | Mô tả                                       | Tham số                                              |
| ---------------------- | ----------------------------- | ------------------------------------------- | ---------------------------------------------------- |
| `baseOwlOption`        | `base-owl-carousel.helper.ts` | Tạo cấu hình cho Owl Carousel               | `options: IParamsOption`, `navTextParams?: string[]` |
| `onDraggingToStopLink` | `base-owl-carousel.helper.ts` | Ngăn chặn click link khi đang drag carousel | `dragging`, `state`, `timeOut?`                      |
