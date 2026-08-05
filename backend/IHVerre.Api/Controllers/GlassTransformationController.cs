using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using IHVerre.Application.Services.GlassTransformation;

namespace IHVerre.Api.Controllers
{
    /// <summary>
    /// Contrôleur pour la gestion de la transformation du verre
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class GlassTransformationController : ControllerBase
    {
        private readonly IGlassTransformationService _transformationService;

        public GlassTransformationController(IGlassTransformationService transformationService)
        {
            _transformationService = transformationService;
        }

        /// <summary>
        /// Crée un nouveau lot de transformation
        /// </summary>
        [HttpPost("batches")]
        public async Task<ActionResult<TransformationBatchDto>> CreateBatch([FromBody] CreateBatchCommand command)
        {
            var result = await _transformationService.CreateBatchAsync(command);
            return CreatedAtAction(nameof(CreateBatch), new { id = result.Id }, result);
        }

        /// <summary>
        /// Démarre un lot de transformation
        /// </summary>
        [HttpPost("batches/{batchId}/start")]
        public async Task<IActionResult> StartBatch(int batchId)
        {
            var result = await _transformationService.StartBatchAsync(batchId);
            return result ? Ok() : BadRequest("Impossible de démarrer le lot");
        }

        /// <summary>
        /// Enregistre la température actuelle d'un lot
        /// </summary>
        [HttpPost("batches/{batchId}/temperature")]
        public async Task<IActionResult> RecordTemperature(int batchId, [FromBody] RecordTemperatureRequest request)
        {
            var result = await _transformationService.RecordTemperatureAsync(batchId, request.Temperature);
            return result ? Ok() : BadRequest("Erreur lors de l'enregistrement");
        }

        /// <summary>
        /// Effectue un contrôle de qualité sur un lot
        /// </summary>
        [HttpPost("batches/{batchId}/quality-check")]
        public async Task<ActionResult<QualityControlDto>> PerformQualityCheck(int batchId, [FromBody] PerformQualityCheckCommand command)
        {
            var result = await _transformationService.PerformQualityCheckAsync(batchId, command);
            return Ok(result);
        }
    }

    public class RecordTemperatureRequest
    {
        public decimal Temperature { get; set; }
    }
}
